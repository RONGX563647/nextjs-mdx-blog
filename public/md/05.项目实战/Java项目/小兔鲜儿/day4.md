黑马小兔鲜儿项目 Day4 的核心是**完善购物车功能**（修改数量、删除商品、清空购物车）、**实现收货地址管理**（新增、编辑、删除、默认地址设置），并开发**结算页面**（整合购物车商品与地址选择，计算最终金额），打通 “购物车→结算” 的关键流程。以下是详细实现：

### 一、Day4 核心目标

1. **购物车功能完善**：支持修改商品数量（实时校验库存）、删除单个商品、清空购物车，同步更新总价与总数量。
2. **收货地址管理**：实现地址的增、删、改、查，支持设置默认地址（结算时自动选中）。
3. **结算页面开发**：整合购物车商品清单、地址选择、计算最终金额（商品总价 + 运费，Day4 简化为商品总价）。

### 二、技术栈补充

- 前端新增：`v-clipboard`（复制地址，可选）、`Element Plus Dialog`（地址弹窗）、`async-validator`（地址表单验证）。
- 后端新增：`事务管理`（购物车修改时校验库存与更新同步）、`逻辑删除`（地址软删除，保留历史记录）。

### 三、核心功能实现

#### 1. 购物车功能完善（前后端）

##### （1）需求分析

- 修改数量：支持增减商品数量，需校验库存（不能超过商品最大库存），修改后实时更新小计与总价。
- 删除商品：支持单个商品删除，删除后更新购物车状态。
- 清空购物车：一键删除当前用户所有购物车商品。

##### （2）后端实现

###### ① 购物车 Service 扩展（修改、删除、清空）

java











```java
// CartService新增方法
public interface CartService extends IService<Cart> {
    // Day3已实现：addToCart()、getCartList()
    R<Void> updateCartCount(Long userId, Long cartId, Integer count); // 修改数量
    R<Void> deleteCartItem(Long userId, Long cartId); // 删除单个商品
    R<Void> clearCart(Long userId); // 清空购物车
}

// CartServiceImpl实现
@Service
@Transactional // 事务管理：确保库存校验与数量更新原子性
public class CartServiceImpl extends ServiceImpl<CartMapper, Cart> implements CartService {

    @Autowired
    private GoodsMapper goodsMapper; // 注入商品Mapper，用于校验库存

    // 修改购物车商品数量
    @Override
    public R<Void> updateCartCount(Long userId, Long cartId, Integer count) {
        // 1. 校验购物车项是否属于当前用户
        Cart cart = baseMapper.selectById(cartId);
        if (cart == null || !cart.getUserId().equals(userId)) {
            return R.error("购物车商品不存在");
        }

        // 2. 校验数量合法性（>0）
        if (count <= 0) {
            return R.error("数量不能小于1");
        }

        // 3. 校验库存（查询商品当前库存）
        Goods goods = goodsMapper.selectById(cart.getGoodsId());
        if (goods == null || goods.getStock() < count) {
            return R.error("库存不足，当前库存：" + (goods == null ? 0 : goods.getStock()));
        }

        // 4. 更新数量
        cart.setCount(count);
        cart.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(cart);
        return R.success(null);
    }

    // 删除单个购物车商品
    @Override
    public R<Void> deleteCartItem(Long userId, Long cartId) {
        // 校验归属权
        Cart cart = baseMapper.selectById(cartId);
        if (cart == null || !cart.getUserId().equals(userId)) {
            return R.error("购物车商品不存在");
        }
        // 物理删除（或逻辑删除，根据业务需求）
        baseMapper.deleteById(cartId);
        return R.success(null);
    }

    // 清空购物车
    @Override
    public R<Void> clearCart(Long userId) {
        LambdaQueryWrapper<Cart> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Cart::getUserId, userId);
        baseMapper.delete(queryWrapper);
        return R.success(null);
    }

    // 其他方法（Day3已实现，略）
}
```

###### ② 购物车 Controller 扩展

java











```java
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    // 修改数量
    @PostMapping("/update")
    public R<Void> updateCartCount(
            @RequestParam Long cartId,
            @RequestParam Integer count
    ) {
        Long userId = 1L; // 实际从Token获取
        return cartService.updateCartCount(userId, cartId, count);
    }

    // 删除单个商品
    @DeleteMapping("/{cartId}")
    public R<Void> deleteCartItem(@PathVariable Long cartId) {
        Long userId = 1L;
        return cartService.deleteCartItem(userId, cartId);
    }

    // 清空购物车
    @DeleteMapping("/clear")
    public R<Void> clearCart() {
        Long userId = 1L;
        return cartService.clearCart(userId);
    }

    // 其他接口（Day3已实现，略）
}
```

##### （3）前端实现

###### ① 购物车 API 扩展（src/api/cart.ts）

typescript











```typescript
import request from './request';

// 修改购物车商品数量
export const updateCartCountApi = (data: {
  cartId: number;
  count: number;
}) => {
  return request.post('/cart/update', data);
};

// 删除单个购物车商品
export const deleteCartItemApi = (cartId: number) => {
  return request.delete(`/cart/${cartId}`);
};

// 清空购物车
export const clearCartApi = () => {
  return request.delete('/cart/clear');
};
```

###### ② 购物车 Store 扩展（src/store/cart.ts）

typescript











```typescript
import { defineStore } from 'pinia';
import { 
  addToCartApi, 
  getCartListApi, 
  updateCartCountApi, 
  deleteCartItemApi, 
  clearCartApi 
} from '@/api/cart';
import { CartVO } from '@/types/cart';
import { ElMessage } from 'element-plus';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartList: [] as CartVO[],
    totalCount: 0, // 总数量
    totalPrice: 0 // 总价
  }),
  actions: {
    // Day3已实现：addToCart()、loadCartList()

    // 修改数量
    async updateCount(cartId: number, count: number) {
      await updateCartCountApi({ cartId, count });
      ElMessage.success('数量已更新');
      this.loadCartList(); // 重新加载购物车
    },

    // 删除单个商品
    async deleteItem(cartId: number) {
      await deleteCartItemApi(cartId);
      ElMessage.success('已删除');
      this.loadCartList();
    },

    // 清空购物车
    async clearAll() {
      await clearCartApi();
      ElMessage.success('购物车已清空');
      this.loadCartList();
    },

    // 重新计算总价和总数量（从cartList同步）
    calculateTotal() {
      this.totalCount = this.cartList.reduce((sum, item) => sum + item.count, 0);
      this.totalPrice = this.cartList.reduce((sum, item) => sum + item.totalPrice, 0);
    }
  },
  // 监听cartList变化时自动计算总价
  watch: {
    cartList: {
      handler() {
        this.calculateTotal();
      },
      immediate: true
    }
  }
});
```

###### ③ 购物车页面组件（src/pages/Cart.vue）

vue











```vue
<template>
  <div class="cart-page">
    <Navbar />

    <!-- 购物车为空时 -->
    <div class="empty-cart" v-if="cartStore.cartList.length === 0">
      <img src="/static/empty-cart.png" alt="购物车为空">
      <p>购物车是空的，快去添加商品吧~</p>
      <el-button @click="$router.push('/')">去首页</el-button>
    </div>

    <!-- 购物车列表 -->
    <div class="cart-list" v-else>
      <div class="cart-item" v-for="item in cartStore.cartList" :key="item.id">
        <img :src="item.image" alt="商品图片" class="goods-img">
        <div class="goods-info">
          <h3 class="goods-name">{{ item.goodsName }}</h3>
          <p class="price">¥{{ item.price }}</p>
        </div>
        <div class="count-op">
          <NumberSelector 
            :min="1" 
            :max="100"  <!-- 实际应从商品库存获取，简化为100 -->
            :model-value="item.count"
            @update:model-value="(count) => handleCountChange(item.id, count)"
          />
        </div>
        <div class="item-total">¥{{ item.totalPrice }}</div>
        <el-button 
          type="text" 
          class="delete-btn" 
          @click="handleDelete(item.id)"
        >
          删除
        </el-button>
      </div>

      <!-- 操作栏 -->
      <div class="cart-footer">
        <el-button type="text" @click="cartStore.clearAll">清空购物车</el-button>
        <div class="total-info">
          <p>合计：<span class="total-price">¥{{ cartStore.totalPrice }}</span></p>
          <el-button type="primary" @click="$router.push('/checkout')">
            去结算（{{ cartStore.totalCount }}件）
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import NumberSelector from '@/components/NumberSelector.vue';
import { useCartStore } from '@/store/cart';

const cartStore = useCartStore();

// 页面加载时加载购物车数据
onMounted(() => {
  cartStore.loadCartList();
});

// 修改数量
const handleCountChange = (cartId: number, count: number) => {
  cartStore.updateCount(cartId, count);
};

// 删除商品
const handleDelete = (cartId: number) => {
  cartStore.deleteItem(cartId);
};
</script>

<style lang="less" scoped>
.cart-page {
  .empty-cart {
    text-align: center;
    padding: 50px 0;
    img {
      width: 150px;
      margin-bottom: 20px;
    }
    p {
      color: #666;
      margin-bottom: 20px;
    }
  }

  .cart-list {
    .cart-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #eee;
      .goods-img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        margin-right: 15px;
      }
      .goods-info {
        flex: 1;
        .goods-name {
          font-size: 16px;
          margin-bottom: 10px;
          color: #333;
        }
        .price {
          color: #ff4d4f;
        }
      }
      .count-op {
        margin: 0 20px;
      }
      .item-total {
        font-weight: bold;
        margin-right: 20px;
      }
      .delete-btn {
        color: #999;
        &:hover {
          color: #ff4d4f;
        }
      }
    }

    .cart-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border-top: 1px solid #eee;
      .total-info {
        text-align: right;
        .total-price {
          color: #ff4d4f;
          font-size: 18px;
          font-weight: bold;
        }
        button {
          width: 150px;
          height: 45px;
          margin-top: 10px;
          font-size: 16px;
        }
      }
    }
  }
}
</style>
```

#### 2. 收货地址管理（前后端）

##### （1）需求分析

- 支持新增地址（姓名、电话、省市区、详细地址），需验证：手机号格式、必填项。
- 支持编辑、删除地址，设置默认地址（同一用户只能有一个默认地址）。

##### （2）后端实现

###### ① 地址实体与 DTO

java











```java
// 地址实体（Address.java）
package com.rabbit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Address {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("user_id")
    private Long userId; // 用户ID
    private String receiver; // 收件人
    private String phone; // 电话
    private String province; // 省
    private String city; // 市
    private String district; // 区
    private String detailAddress; // 详细地址
    @TableField("is_default")
    private Integer isDefault; // 是否默认（1-是，0-否）
    @TableField("create_time")
    private LocalDateTime createTime;
    @TableField("update_time")
    private LocalDateTime updateTime;
}

// 地址DTO（接收前端参数）
package com.rabbit.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
public class AddressDTO {
    private Long id; // 新增时为空，编辑时传值
    @NotBlank(message = "收件人不能为空")
    private String receiver;
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式错误")
    private String phone;
    @NotBlank(message = "省份不能为空")
    private String province;
    @NotBlank(message = "城市不能为空")
    private String city;
    @NotBlank(message = "区/县不能为空")
    private String district;
    @NotBlank(message = "详细地址不能为空")
    private String detailAddress;
    private Integer isDefault = 0; // 默认非默认地址
}
```

###### ② 地址 Service 与 Controller

java











```java
// AddressService.java
public interface AddressService extends IService<Address> {
    R<List<Address>> getUserAddresses(Long userId); // 获取用户地址列表
    R<Address> addAddress(Long userId, AddressDTO dto); // 新增地址
    R<Void> updateAddress(Long userId, AddressDTO dto); // 编辑地址
    R<Void> deleteAddress(Long userId, Long addressId); // 删除地址
    R<Void> setDefault(Long userId, Long addressId); // 设置默认地址
}

// AddressServiceImpl.java
@Service
@Transactional
public class AddressServiceImpl extends ServiceImpl<AddressMapper, Address> implements AddressService {

    // 获取用户地址列表
    @Override
    public R<List<Address>> getUserAddresses(Long userId) {
        LambdaQueryWrapper<Address> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Address::getUserId, userId)
                    .orderByDesc(Address::getIsDefault) // 默认地址排前面
                    .orderByDesc(Address::getUpdateTime);
        List<Address> addresses = baseMapper.selectList(queryWrapper);
        return R.success(addresses);
    }

    // 新增地址
    @Override
    public R<Address> addAddress(Long userId, AddressDTO dto) {
        Address address = new Address();
        BeanUtils.copyProperties(dto, address);
        address.setUserId(userId);

        // 若设置为默认地址，先取消其他地址的默认状态
        if (dto.getIsDefault() == 1) {
            LambdaUpdateWrapper<Address> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(Address::getUserId, userId)
                        .set(Address::getIsDefault, 0);
            baseMapper.update(null, updateWrapper);
        }

        baseMapper.insert(address);
        return R.success(address);
    }

    // 编辑地址
    @Override
    public R<Void> updateAddress(Long userId, AddressDTO dto) {
        Address address = baseMapper.selectById(dto.getId());
        if (address == null || !address.getUserId().equals(userId)) {
            return R.error("地址不存在");
        }

        BeanUtils.copyProperties(dto, address);

        // 若设置为默认，取消其他默认
        if (dto.getIsDefault() == 1) {
            LambdaUpdateWrapper<Address> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(Address::getUserId, userId)
                        .set(Address::getIsDefault, 0);
            baseMapper.update(null, updateWrapper);
        }

        baseMapper.updateById(address);
        return R.success(null);
    }

    // 删除地址
    @Override
    public R<Void> deleteAddress(Long userId, Long addressId) {
        Address address = baseMapper.selectById(addressId);
        if (address == null || !address.getUserId().equals(userId)) {
            return R.error("地址不存在");
        }
        baseMapper.deleteById(addressId);
        return R.success(null);
    }

    // 设置默认地址
    @Override
    public R<Void> setDefault(Long userId, Long addressId) {
        // 先取消所有默认
        LambdaUpdateWrapper<Address> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Address::getUserId, userId)
                    .set(Address::getIsDefault, 0);
        baseMapper.update(null, updateWrapper);

        // 设置当前地址为默认
        Address address = baseMapper.selectById(addressId);
        if (address == null || !address.getUserId().equals(userId)) {
            return R.error("地址不存在");
        }
        address.setIsDefault(1);
        baseMapper.updateById(address);
        return R.success(null);
    }
}

// AddressController.java
@RestController
@RequestMapping("/address")
@RequiredArgsConstructor
public class AddressController {
    private final AddressService addressService;

    // 获取用户地址列表
    @GetMapping("/list")
    public R<List<Address>> getUserAddresses() {
        Long userId = 1L; // 实际从Token获取
        return addressService.getUserAddresses(userId);
    }

    // 新增地址
    @PostMapping("/add")
    public R<Address> addAddress(@Validated @RequestBody AddressDTO dto) {
        Long userId = 1L;
        return addressService.addAddress(userId, dto);
    }

    // 编辑地址
    @PutMapping("/update")
    public R<Void> updateAddress(@Validated @RequestBody AddressDTO dto) {
        Long userId = 1L;
        return addressService.updateAddress(userId, dto);
    }

    // 删除地址
    @DeleteMapping("/{id}")
    public R<Void> deleteAddress(@PathVariable Long id) {
        Long userId = 1L;
        return addressService.deleteAddress(userId, id);
    }

    // 设置默认地址
    @PostMapping("/set-default/{id}")
    public R<Void> setDefault(@PathVariable Long id) {
        Long userId = 1L;
        return addressService.setDefault(userId, id);
    }
}
```

##### （3）前端实现

###### ① 地址 API（src/api/address.ts）

typescript











```typescript
import request from './request';
import { AddressDTO } from '@/types/address';

// 获取地址列表
export const getAddressListApi = () => {
  return request.get('/address/list');
};

// 新增地址
export const addAddressApi = (data: AddressDTO) => {
  return request.post('/address/add', data);
};

// 编辑地址
export const updateAddressApi = (data: AddressDTO) => {
  return request.put('/address/update', data);
};

// 删除地址
export const deleteAddressApi = (id: number) => {
  return request.delete(`/address/${id}`);
};

// 设置默认地址
export const setDefaultAddressApi = (id: number) => {
  return request.post(`/address/set-default/${id}`);
};
```

###### ② 地址 Store（src/store/address.ts）

typescript











```typescript
import { defineStore } from 'pinia';
import { 
  getAddressListApi, 
  addAddressApi, 
  updateAddressApi, 
  deleteAddressApi, 
  setDefaultAddressApi 
} from '@/api/address';
import { Address, AddressDTO } from '@/types/address';
import { ElMessage } from 'element-plus';

export const useAddressStore = defineStore('address', {
  state: () => ({
    addressList: [] as Address[],
    defaultAddress: null as Address | null // 默认地址
  }),
  actions: {
    // 加载地址列表
    async loadAddressList() {
      const data = await getAddressListApi();
      this.addressList = data;
      // 同步默认地址
      this.defaultAddress = data.find(item => item.isDefault === 1) || null;
    },

    // 新增地址
    async addAddress(dto: AddressDTO) {
      await addAddressApi(dto);
      ElMessage.success('地址已添加');
      this.loadAddressList();
    },

    // 编辑地址
    async updateAddress(dto: AddressDTO) {
      await updateAddressApi(dto);
      ElMessage.success('地址已更新');
      this.loadAddressList();
    },

    // 删除地址
    async deleteAddress(id: number) {
      await deleteAddressApi(id);
      ElMessage.success('地址已删除');
      this.loadAddressList();
    },

    // 设置默认地址
    async setDefault(id: number) {
      await setDefaultAddressApi(id);
      ElMessage.success('已设为默认地址');
      this.loadAddressList();
    }
  }
});
```

###### ③ 地址列表与编辑组件

vue











```vue
<!-- 地址列表组件（src/pages/AddressList.vue） -->
<template>
  <div class="address-list">
    <Navbar />
    <div class="title">收货地址</div>

    <!-- 地址列表 -->
    <div class="address-items">
      <div 
        class="address-item" 
        v-for="addr in addressStore.addressList" 
        :key="addr.id"
      >
        <div class="addr-info">
          <div class="receiver">
            {{ addr.receiver }} {{ addr.phone }}
            <span v-if="addr.isDefault === 1" class="default-tag">默认</span>
          </div>
          <div class="addr-detail">
            {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detailAddress }}
          </div>
        </div>
        <div class="addr-actions">
          <span @click="handleEdit(addr)">编辑</span>
          <span @click="handleSetDefault(addr.id)" v-if="addr.isDefault !== 1">设为默认</span>
          <span @click="handleDelete(addr.id)">删除</span>
        </div>
      </div>
    </div>

    <!-- 添加地址按钮 -->
    <el-button 
      type="primary" 
      class="add-btn"
      @click="$router.push('/address/edit')"
    >
      + 添加新地址
    </el-button>

    <!-- 地址编辑弹窗（复用同一个组件） -->
    <AddressEditDialog 
      :visible="dialogVisible" 
      :edit-address="editAddress"
      @close="dialogVisible = false"
      @save="dialogVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import { useAddressStore } from '@/store/address';
import AddressEditDialog from '@/components/AddressEditDialog.vue';
import { Address } from '@/types/address';

const addressStore = useAddressStore();
const dialogVisible = ref(false);
const editAddress = ref<Address | null>(null);

// 加载地址列表
onMounted(() => {
  addressStore.loadAddressList();
});

// 编辑地址
const handleEdit = (addr: Address) => {
  editAddress.value = addr;
  dialogVisible.value = true;
};

// 删除地址
const handleDelete = (id: number) => {
  addressStore.deleteAddress(id);
};

// 设置默认地址
const handleSetDefault = (id: number) => {
  addressStore.setDefault(id);
};
</script>

<style lang="less" scoped>
.address-list {
  .title {
    padding: 15px;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
  }

  .address-items {
    padding: 15px;

    .address-item {
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 10px;
      position: relative;

      .addr-info {
        .receiver {
          margin-bottom: 5px;
          .default-tag {
            display: inline-block;
            margin-left: 10px;
            padding: 2px 5px;
            background: #ff4d4f;
            color: white;
            font-size: 12px;
            border-radius: 4px;
          }
        }
        .addr-detail {
          color: #666;
        }
      }

      .addr-actions {
        position: absolute;
        right: 15px;
        top: 15px;
        display: flex;
        gap: 15px;
        color: #666;
        span {
          cursor: pointer;
          &:hover {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  .add-btn {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    height: 45px;
    font-size: 16px;
  }
}
</style>
```

vue











```vue
<!-- 地址编辑弹窗（src/components/AddressEditDialog.vue） -->
<template>
  <el-dialog 
    title="编辑地址" 
    :visible="visible" 
    :close-on-click-modal="false"
    @close="onClose"
  >
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="formRef"
      label-width="80px"
    >
      <el-form-item label="收件人" prop="receiver">
        <el-input v-model="form.receiver"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="省份" prop="province">
        <el-input v-model="form.province"></el-input>
      </el-form-item>
      <el-form-item label="城市" prop="city">
        <el-input v-model="form.city"></el-input>
      </el-form-item>
      <el-form-item label="区/县" prop="district">
        <el-input v-model="form.district"></el-input>
      </el-form-item>
      <el-form-item label="详细地址" prop="detailAddress">
        <el-input v-model="form.detailAddress"></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.isDefault" label="设为默认地址"></el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElCheckbox, ElButton, ElDialog } from 'element-plus';
import { Address, AddressDTO } from '@/types/address';
import { useAddressStore } from '@/store/address';

// 接收参数
const props = defineProps<{
  visible: boolean;
  editAddress?: Address | null;
}>();

// 表单数据
const form = ref<AddressDTO>({
  id: undefined,
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: 0
});

// 表单规则
const rules = {
  receiver: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区/县', trigger: 'blur' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
};

const formRef = ref<InstanceType<typeof ElForm>>();
const addressStore = useAddressStore();

// 监听编辑地址变化，同步到表单
watch(
  () => props.editAddress,
  (addr) => {
    if (addr) {
      form.value = {
        id: addr.id,
        receiver: addr.receiver,
        phone: addr.phone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        detailAddress: addr.detailAddress,
        isDefault: addr.isDefault
      };
    } else {
      // 新增地址时重置表单
      form.value = {
        id: undefined,
        receiver: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        isDefault: 0
      };
    }
  },
  { immediate: true }
);

// 保存地址
const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();

  if (form.value.id) {
    // 编辑地址
    await addressStore.updateAddress(form.value);
  } else {
    // 新增地址
    await addressStore.addAddress(form.value);
  }
  emit('save');
};

// 关闭弹窗
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const onClose = () => {
  emit('close');
};
</script>
```

#### 3. 结算页面（前端）

vue











```vue
<template>
  <div class="checkout-page">
    <Navbar />

    <!-- 地址选择 -->
    <div class="address-section">
      <div class="section-title">收货地址</div>
      <div class="address-content" @click="$router.push('/address/list')">
        <template v-if="addressStore.defaultAddress">
          <p class="receiver">
            {{ addressStore.defaultAddress.receiver }} {{ addressStore.defaultAddress.phone }}
          </p>
          <p class="addr-detail">
            {{ addressStore.defaultAddress.province }} {{ addressStore.defaultAddress.city }} {{ addressStore.defaultAddress.district }} {{ addressStore.defaultAddress.detailAddress }}
          </p>
        </template>
        <template v-else>
          <p class="no-address">请添加收货地址</p>
        </template>
        <el-icon class="arrow-icon"><Right /></el-icon>
      </div>
    </div>

    <!-- 商品清单 -->
    <div class="goods-section">
      <div class="section-title">商品清单</div>
      <div class="goods-list">
        <div class="goods-item" v-for="item in cartStore.cartList" :key="item.id">
          <img :src="item.image" alt="商品图片" class="goods-img">
          <div class="goods-info">
            <p class="goods-name">{{ item.goodsName }}</p>
            <p class="price-count">
              ¥{{ item.price }} × {{ item.count }}
            </p>
          </div>
          <div class="item-total">¥{{ item.totalPrice }}</div>
        </div>
      </div>
    </div>

    <!-- 结算信息 -->
    <div class="checkout-footer">
      <div class="total">
        合计：<span class="total-price">¥{{ cartStore.totalPrice }}</span>
      </div>
      <el-button 
        type="primary" 
        @click="handleSubmit"
        :disabled="!addressStore.defaultAddress || cartStore.cartList.length === 0"
      >
        提交订单
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Right } from '@element-plus/icons-vue';
import Navbar from '@/components/Navbar.vue';
import { useCartStore } from '@/store/cart';
import { useAddressStore } from '@/store/address';
import { ElMessage } from 'element-plus';

const cartStore = useCartStore();
const addressStore = useAddressStore();

// 加载购物车和地址数据
onMounted(() => {
  cartStore.loadCartList();
  addressStore.loadAddressList();
});

// 提交订单（Day4简化为提示，Day5实现实际创建订单）
const handleSubmit = () => {
  ElMessage.success('订单提交成功！（Day5实现支付流程）');
};
</script>

<style lang="less" scoped>
.checkout-page {
  .address-section, .goods-section {
    margin-bottom: 10px;
    background: white;
    padding: 15px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
  }

  .address-content {
    display: flex;
    align-items: center;
    padding: 15px;
    border: 1px dashed #eee;
    border-radius: 8px;
    cursor: pointer;
    position: relative;

    .no-address {
      color: #999;
    }

    .arrow-icon {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }
  }

  .goods-list {
    .goods-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;

      .goods-img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        margin-right: 15px;
      }

      .goods-info {
        flex: 1;
        .goods-name {
          color: #333;
          margin-bottom: 5px;
        }
        .price-count {
          color: #666;
          font-size: 14px;
        }
      }

      .item-total {
        color: #333;
        font-weight: bold;
      }
    }
  }

  .checkout-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: white;
    border-top: 1px solid #eee;

    .total {
      font-size: 16px;
      .total-price {
        color: #ff4d4f;
        font-size: 18px;
        font-weight: bold;
        margin-left: 5px;
      }
    }

    button {
      width: 150px;
      height: 45px;
      font-size: 16px;
    }
  }
}
</style>
```

### 四、Day4 测试与总结

1. **购物车流程**：修改数量→校验库存→更新总价；删除商品→列表减少→总价更新；清空购物车→显示空状态。
2. **地址流程**：新增地址→表单验证→列表显示；编辑地址→保存后更新；设置默认→自动取消其他默认。
3. **结算流程**：选择地址→展示商品清单→确认总价→提交订单（提示成功）。

### 总结

Day4 通过**完善购物车交互**、**实现地址管理**、**开发结算页面**，打通了 “购物车→结算” 的核心流程，重点体现：

1. **数据一致性**：购物车数量 / 地址修改后实时同步到后端，确保状态准确。
2. **用户体验**：空状态提示、默认地址自动选中、结算按钮状态联动（禁用 / 启用）。
3. **功能串联**：结算页面整合购物车与地址数据，为后续订单创建和支付功能铺垫。

这些功能让项目从 “购物车管理” 迈向 “交易闭环”，核心是通过前后端协作实现数据的增删改查与状态同步