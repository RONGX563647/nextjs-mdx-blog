黑马小兔鲜儿项目 Day3 的核心是**深化商品模块**（商品详情页、商品列表分页与筛选）和**实现购物车基础功能**（添加商品、修改数量），打通 “浏览商品→查看详情→加入购物车” 的核心流程。以下是详细实现：

### 一、Day3 核心目标

1. 开发**商品详情页**（展示商品多图、规格、库存、详情描述）。
2. 实现**商品列表分页与筛选**（按分类、价格排序，支持分页加载）。
3. 开发**购物车基础功能**（添加商品、修改数量、计算总价，基于 Pinia + 数据库）。
4. 封装**通用分页组件**和**商品数量调整组件**，提升复用性。

### 二、技术栈补充

- 前端新增：`vue3-lazyload`（图片懒加载，优化性能）、`Element Plus Pagination`（分页组件）。
- 后端新增：`MyBatis-Plus 分页插件`（简化分页查询）、`Java Bean Validation`（强化参数校验）。

### 三、核心功能实现

#### 1. 商品详情页（前后端）

##### （1）需求分析

- 展示商品基本信息：名称、价格、原价、销量、库存。
- 展示商品图片：主图 + 多图预览（支持点击切换）。
- 支持选择商品数量（1~ 库存上限），点击 “加入购物车” 按钮触发添加逻辑。

##### （2）后端实现

###### ① 商品详情 DTO（返回前端的详细数据）

java











```java
package com.rabbit.dto;

import com.rabbit.entity.Goods;
import lombok.Data;
import java.util.List;

@Data
public class GoodsDetailDTO extends Goods {
    private List<String> imageList; // 商品多图（主图+详情图）
    private String detail; // 商品详情描述（HTML格式）
}
```

###### ② 分页插件配置（MyBatis-Plus）

java











```java
package com.rabbit.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyBatisPlusConfig {
    // 配置分页插件
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor()); // 分页插件
        return interceptor;
    }
}
```

###### ③ 商品详情接口（Service+Controller）

java











```java
// GoodsService新增方法
public interface GoodsService extends IService<Goods> {
    // Day2已实现：getHomeGoods()
    R<GoodsDetailDTO> getGoodsDetail(Long id); // 商品详情
    R<IPage<Goods>> getGoodsByPage(Integer page, Integer size, Long categoryId); // 分页查询
}

// GoodsServiceImpl实现
@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {
    // 商品详情
    @Override
    public R<GoodsDetailDTO> getGoodsDetail(Long id) {
        // 1. 查询商品基本信息
        Goods goods = baseMapper.selectById(id);
        if (goods == null || goods.getStatus() != 1) {
            return R.error("商品不存在或已下架");
        }

        // 2. 构建详情DTO（实际项目中可能从其他表查询图片和详情）
        GoodsDetailDTO dto = new GoodsDetailDTO();
        BeanUtils.copyProperties(goods, dto);
        // 模拟多图数据（实际从goods_image表查询）
        dto.setImageList(Arrays.asList(
            goods.getImage(), 
            goods.getImage().replace(".jpg", "_1.jpg"),
            goods.getImage().replace(".jpg", "_2.jpg")
        ));
        // 模拟详情描述（实际从goods_detail表查询）
        dto.setDetail("<p>新鲜直达，品质保证，当日采摘</p><p>支持7天无理由退换</p>");

        return R.success(dto);
    }

    // 分页查询商品（支持按分类筛选）
    @Override
    public R<IPage<Goods>> getGoodsByPage(Integer page, Integer size, Long categoryId) {
        Page<Goods> pageInfo = new Page<>(page, size);
        LambdaQueryWrapper<Goods> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Goods::getStatus, 1); // 只查上架商品
        if (categoryId != null && categoryId > 0) {
            queryWrapper.eq(Goods::getCategoryId, categoryId); // 按分类筛选
        }
        queryWrapper.orderByDesc(Goods::getSales); // 默认按销量降序
        IPage<Goods> result = baseMapper.selectPage(pageInfo, queryWrapper);
        return R.success(result);
    }
}

// GoodsController新增接口
@RestController
@RequiredArgsConstructor
public class GoodsController {
    private final GoodsService goodsService;

    // 商品详情
    @GetMapping("/goods/detail/{id}")
    public R<GoodsDetailDTO> getGoodsDetail(@PathVariable Long id) {
        return goodsService.getGoodsDetail(id);
    }

    // 商品分页查询
    @GetMapping("/goods/page")
    public R<IPage<Goods>> getGoodsByPage(
            @RequestParam(defaultValue = "1") Integer page, // 默认第1页
            @RequestParam(defaultValue = "10") Integer size, // 默认每页10条
            @RequestParam(required = false) Long categoryId // 可选：分类ID
    ) {
        return goodsService.getGoodsByPage(page, size, categoryId);
    }
}
```

##### （3）前端实现

###### ① 商品详情 API（src/api/goods.ts 新增）

typescript











```typescript
import request from './request';

// 获取商品详情
export const getGoodsDetailApi = (id: number) => {
  return request.get(`/goods/detail/${id}`);
};

// 商品分页查询
export const getGoodsByPageApi = (params: {
  page: number;
  size: number;
  categoryId?: number;
}) => {
  return request.get('/goods/page', { params });
};
```

###### ② 商品详情页组件（src/pages/GoodsDetail.vue）

vue











```vue
<template>
  <div class="goods-detail">
    <!-- 商品图片预览 -->
    <div class="goods-images">
      <img 
        v-for="(img, index) in goodsDetail.imageList" 
        :key="index" 
        :src="img" 
        :alt="goodsDetail.name"
        v-lazy
      >
    </div>

    <!-- 商品基本信息 -->
    <div class="goods-info">
      <h1 class="goods-name">{{ goodsDetail.name }}</h1>
      <div class="price-box">
        <span class="current-price">¥{{ goodsDetail.price }}</span>
        <span class="original-price" v-if="goodsDetail.originalPrice">¥{{ goodsDetail.originalPrice }}</span>
        <span class="sales">销量：{{ goodsDetail.sales }}件</span>
      </div>
    </div>

    <!-- 数量选择 -->
    <div class="count-selector">
      <span>数量：</span>
      <NumberSelector 
        :min="1" 
        :max="goodsDetail.stock" 
        v-model="count"
      />
    </div>

    <!-- 商品详情 -->
    <div class="goods-desc" v-html="goodsDetail.detail"></div>

    <!-- 加入购物车按钮 -->
    <div class="cart-btn">
      <el-button type="primary" size="large" @click="addToCart">
        加入购物车
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getGoodsDetailApi } from '@/api/goods';
import { GoodsDetailDTO } from '@/types/goods';
import NumberSelector from '@/components/NumberSelector.vue'; // 数量调整组件
import { useCartStore } from '@/store/cart'; // 购物车Store
import { ElMessage } from 'element-plus';

// 商品详情数据
const goodsDetail = ref<GoodsDetailDTO>({} as GoodsDetailDTO);
// 选择数量
const count = ref(1);
// 路由参数（获取商品ID）
const route = useRoute();
const goodsId = Number(route.params.id); // 从路由参数获取ID
// 购物车Store
const cartStore = useCartStore();

// 加载商品详情
onMounted(async () => {
  const data = await getGoodsDetailApi(goodsId);
  goodsDetail.value = data;
});

// 加入购物车
const addToCart = () => {
  if (!goodsDetail.value.id) return;
  // 调用购物车Store的添加方法
  cartStore.addItem({
    goodsId: goodsDetail.value.id,
    name: goodsDetail.value.name,
    image: goodsDetail.value.image,
    price: goodsDetail.value.price,
    count: count.value
  });
  ElMessage.success('加入购物车成功');
};
</script>

<style lang="less" scoped>
.goods-detail {
  .goods-images {
    width: 100%;
    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }

  .goods-info {
    padding: 15px;
    background: white;
    .goods-name {
      font-size: 18px;
      margin-bottom: 10px;
      color: #333;
    }
    .price-box {
      .current-price {
        color: #ff4d4f;
        font-size: 20px;
        font-weight: bold;
      }
      .original-price {
        color: #999;
        text-decoration: line-through;
        margin-left: 10px;
      }
      .sales {
        float: right;
        color: #666;
        font-size: 14px;
      }
    }
  }

  .count-selector {
    padding: 15px;
    background: white;
    margin-top: 10px;
    display: flex;
    align-items: center;
  }

  .goods-desc {
    padding: 15px;
    background: white;
    margin-top: 10px;
    p {
      margin: 10px 0;
    }
  }

  .cart-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 15px;
    background: white;
    border-top: 1px solid #eee;
    button {
      width: 100%;
      height: 45px;
      font-size: 16px;
    }
  }
</style>
```

#### 2. 商品列表分页与筛选（首页优化）

##### （1）前端分页组件（src/components/Pagination.vue）

vue











```vue
<template>
  <div class="pagination">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script setup lang="ts">
// 接收分页参数
const props = defineProps<{
  currentPage: number;
  pageSize: number;
  total: number;
}>();

// 触发分页变化
const emit = defineEmits<{
  (e: 'size-change', size: number): void;
  (e: 'current-change', page: number): void;
}>();

const handleSizeChange = (size: number) => {
  emit('size-change', size);
};

const handleCurrentChange = (page: number) => {
  emit('current-change', page);
};
</script>

<style lang="less" scoped>
.pagination {
  padding: 20px;
  text-align: center;
  background: white;
}
</style>
```

##### （2）首页商品列表优化（支持分页和分类筛选）

vue











```vue
<!-- src/pages/Home.vue 优化 -->
<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <Navbar />

    <!-- 分类导航 -->
    <CategoryNav 
      :current-category-id="currentCategoryId"
      @change="handleCategoryChange"
    />

    <!-- 商品列表 -->
    <div class="goods-list">
      <div class="goods-grid">
        <GoodsCard 
          v-for="goods in goodsList" 
          :key="goods.id" 
          :goods="goods"
          @click="toDetail(goods.id)"
        />
      </div>

      <!-- 分页组件 -->
      <Pagination 
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import CategoryNav from '@/components/CategoryNav.vue';
import GoodsCard from '@/components/GoodsCard.vue';
import Pagination from '@/components/Pagination.vue';
import { getGoodsByPageApi } from '@/api/goods';

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// 商品列表
const goodsList = ref([]);
// 当前分类ID（0表示全部）
const currentCategoryId = ref(0);
// 路由
const router = useRouter();

// 加载商品列表
const loadGoodsList = async () => {
  const data = await getGoodsByPageApi({
    page: currentPage.value,
    size: pageSize.value,
    categoryId: currentCategoryId.value || undefined
  });
  goodsList.value = data.records; // 分页数据列表
  total.value = data.total; // 总条数
};

// 初始加载
onMounted(loadGoodsList);

// 监听分类变化，重新加载第一页
watch(currentCategoryId, (newVal) => {
  currentPage.value = 1; // 切换分类后重置到第一页
  loadGoodsList();
});

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadGoodsList();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1; // 改变每页条数后重置到第一页
  loadGoodsList();
};

// 点击分类
const handleCategoryChange = (id: number) => {
  currentCategoryId.value = id;
};

// 跳转到商品详情
const toDetail = (id: number) => {
  router.push(`/goods/detail/${id}`);
};
</script>
```

#### 3. 购物车基础功能（基于 Pinia + 数据库）

##### （1）购物车实体与 API

###### ① 后端购物车实体与接口

java











```java
// 购物车实体（Cart.java）
package com.rabbit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Cart {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("user_id")
    private Long userId; // 用户ID（关联登录用户）
    @TableField("goods_id")
    private Long goodsId; // 商品ID
    private Integer count; // 数量
    @TableField("create_time")
    private LocalDateTime createTime;
    @TableField("update_time")
    private LocalDateTime updateTime;
}

// 购物车Service（CartService.java）
public interface CartService extends IService<Cart> {
    R<Void> addToCart(Long userId, Long goodsId, Integer count); // 添加商品
    R<List<CartVO>> getCartList(Long userId); // 获取购物车列表
}

// 购物车VO（返回给前端的购物车数据，包含商品信息）
package com.rabbit.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartVO {
    private Long id; // 购物车ID
    private Long goodsId; // 商品ID
    private String goodsName; // 商品名称
    private String image; // 商品图片
    private BigDecimal price; // 商品单价
    private Integer count; // 数量
    private BigDecimal totalPrice; // 小计（price * count）
}

// 购物车Controller（CartController.java）
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final UserService userService; // 用于获取当前登录用户ID（后续用Token，Day3简化为固定ID）

    // 添加商品到购物车（Day3简化：假设用户ID=1，后续用Token获取）
    @PostMapping("/add")
    public R<Void> addToCart(
            @RequestParam Long goodsId,
            @RequestParam Integer count
    ) {
        Long userId = 1L; // 实际项目中从Token或Session获取
        return cartService.addToCart(userId, goodsId, count);
    }

    // 获取购物车列表
    @GetMapping("/list")
    public R<List<CartVO>> getCartList() {
        Long userId = 1L; // 同上
        return cartService.getCartList(userId);
    }
}
```

###### ② 前端购物车 API 与 Store

typescript











```typescript
// src/api/cart.ts
import request from './request';

// 添加商品到购物车
export const addToCartApi = (data: {
  goodsId: number;
  count: number;
}) => {
  return request.post('/cart/add', data);
};

// 获取购物车列表
export const getCartListApi = () => {
  return request.get('/cart/list');
};

// src/store/cart.ts（购物车Store）
import { defineStore } from 'pinia';
import { addToCartApi, getCartListApi } from '@/api/cart';
import { CartVO } from '@/types/cart';
import { ElMessage } from 'element-plus';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartList: [] as CartVO[],
    totalCount: 0, // 购物车总数量
    totalPrice: 0 // 购物车总价
  }),
  actions: {
    // 添加商品到购物车
    async addToCart(goods: {
      goodsId: number;
      name: string;
      image: string;
      price: number;
      count: number;
    }) {
      await addToCartApi({
        goodsId: goods.goodsId,
        count: goods.count
      });
      ElMessage.success('添加成功');
      // 重新加载购物车列表
      this.loadCartList();
    },

    // 加载购物车列表
    async loadCartList() {
      const data = await getCartListApi();
      this.cartList = data;
      // 计算总数量和总价
      this.totalCount = data.reduce((sum, item) => sum + item.count, 0);
      this.totalPrice = data.reduce((sum, item) => sum + item.totalPrice, 0);
    }
  }
});
```

###### ③ 数量调整组件（src/components/NumberSelector.vue）

vue











```vue
<template>
  <div class="number-selector">
    <button 
      class="btn minus" 
      @click="decrement" 
      :disabled="current <= min"
    >
      -
    </button>
    <span class="number">{{ current }}</span>
    <button 
      class="btn plus" 
      @click="increment" 
      :disabled="current >= max"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// 接收参数
const props = defineProps<{
  min: number; // 最小值
  max: number; // 最大值
  modelValue: number; // 双向绑定值
}>();

// 当前值
const current = ref(props.modelValue);

// 同步父组件值
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

// 监听父组件值变化
watch(
  () => props.modelValue,
  (newVal) => {
    current.value = newVal;
  }
);

// 减少数量
const decrement = () => {
  if (current.value > props.min) {
    current.value--;
    emit('update:modelValue', current.value);
  }
};

// 增加数量
const increment = () => {
  if (current.value < props.max) {
    current.value++;
    emit('update:modelValue', current.value);
  }
};
</script>

<style lang="less" scoped>
.number-selector {
  display: inline-flex;
  align-items: center;

  .btn {
    width: 30px;
    height: 30px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .number {
    width: 40px;
    text-align: center;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }
}
</style>
```

### 四、Day3 功能串联与测试

1. **商品详情流程**：首页点击商品卡片 → 路由跳转到`/goods/detail/:id` → 组件加载时请求商品详情接口 → 展示多图、价格、数量选择器 → 点击 “加入购物车” → 调用购物车 API → 刷新购物车状态。
2. **分页与筛选**：首页选择分类 → 触发商品列表按分类 + 分页查询 → 切换页码 / 每页条数 → 重新加载对应数据 → 分页组件同步更新状态。
3. **购物车功能**：添加商品后 → 购物车 Store 调用`loadCartList` → 更新`totalCount`（后续在导航栏显示购物车数量，Day4 实现）。

### 总结

Day3 通过以下功能深化了电商核心流程：

1. **商品详情**：支持多图展示、数量选择、详情描述，打通 “浏览→了解详情” 环节。
2. **分页筛选**：优化商品列表加载性能，支持按分类和页码查询，提升用户体验。
3. **购物车基础**：实现添加商品、数量控制，基于 Pinia 管理购物车状态，为后续结算功能铺垫。

这些功能让项目从 “基础展示” 迈向 “可交互的电商流程”，核心是通过前后端协作实现数据的分页、详情查询和状态同步。





