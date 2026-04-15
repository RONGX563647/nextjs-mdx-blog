黑马小兔鲜儿项目 Day2 的核心是**完善用户体系**（注册、登录状态管理）、**深化商品模块**（分类导航、商品列表分页），并封装**公共 UI 组件**（导航栏、分类菜单），为后续功能奠定基础。以下是详细实现：

### 一、Day2 核心目标

1. 实现**用户注册**功能（与登录联动，完善用户体系）。
2. 开发**商品分类导航**（首页分类菜单，支持点击切换分类）。
3. 封装**公共组件**（导航栏、分类菜单、商品卡片），提升复用性。
4. 引入**Pinia 全局状态管理**（管理用户信息、登录状态，替代 localStorage）。
5. 添加**路由守卫**（控制未登录用户访问权限）。

### 二、技术栈补充

- 前端新增：`Element Plus`（UI 组件库，简化表单、弹窗开发）、`Pinia`（状态管理）、`VeeValidate`（表单验证，可选）。
- 后端新增：`Spring Validation`（请求参数校验）、`Redis`（可选，缓存分类数据，Day2 简化为数据库查询）。

### 三、核心功能实现

#### 1. 用户注册功能（前后端）

##### （1）需求分析

- 支持用户通过手机号 / 用户名注册，需验证：用户名唯一、密码强度（至少 6 位）、手机号格式。
- 注册成功后自动登录（返回用户信息，更新全局状态）。

##### （2）后端实现

###### ① 注册 DTO（数据传输对象，接收前端参数）

java











```java
package com.rabbit.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
public class UserRegisterDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度需3-20位")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码至少6位")
    private String password;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式错误") // 简单手机号校验
    private String phone; // 可选，非必填
}
```

###### ② 服务层（UserService 新增注册方法）

java











```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    // 登录方法（Day1已实现，略）

    // 注册方法
    public R<User> register(UserRegisterDTO dto) {
        // 1. 校验用户名是否已存在
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, dto.getUsername());
        User existUser = baseMapper.selectOne(queryWrapper);
        if (existUser != null) {
            return R.error("用户名已被占用");
        }

        // 2. 密码加密（MD5，同登录逻辑）
        String md5Password = DigestUtils.md5DigestAsHex(dto.getPassword().getBytes());

        // 3. 构建User对象
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(md5Password);
        user.setPhone(dto.getPhone());
        user.setNickname("小兔用户_" + dto.getUsername().substring(0, 3)); // 默认昵称
        user.setStatus(1); // 默认为正常状态

        // 4. 保存到数据库
        baseMapper.insert(user);

        // 5. 注册成功，返回用户信息（隐藏密码）
        user.setPassword(null); // 避免返回密码
        return R.success(user);
    }
}
```

###### ③ 控制器（UserController 新增注册接口）

java











```java
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // 登录接口（Day1已实现，略）

    // 注册接口
    @PostMapping("/user/register")
    public R<User> register(@Validated @RequestBody UserRegisterDTO dto) { // @Validated开启参数校验
        return userService.register(dto);
    }
}
```

##### （3）前端实现

###### ① 注册 API（src/api/user.ts 新增）

typescript











```typescript
import request from './request';
import { UserRegisterDTO } from '@/types/user'; // 定义TS类型

// 注册请求
export const registerApi = (data: UserRegisterDTO) => {
  return request.post('/user/register', data);
};
```

###### ② 注册页面组件（src/pages/Register.vue）

vue











```vue
<template>
  <div class="register-container">
    <div class="register-box">
      <h2>小兔鲜儿 - 注册</h2>
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="3-20位字符"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" placeholder="至少6位"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="选填，格式11位数字"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" class="register-btn">注册</el-button>
        </el-form-item>
        <div class="to-login">
          已有账号？<span @click="$router.push('/login')">去登录</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus';
import { registerApi } from '@/api/user';
import { useUserStore } from '@/store/user'; // 后续引入Pinia

// 表单数据
const form = reactive({
  username: '',
  password: '',
  phone: ''
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ]
};

const formRef = ref<InstanceType<typeof ElForm>>();
const router = useRouter();
const userStore = useUserStore();

// 注册处理
const handleRegister = async () => {
  // 表单验证
  if (!formRef.value) return;
  await formRef.value.validate();

  try {
    const user = await registerApi(form);
    // 注册成功后自动登录（更新Pinia状态）
    userStore.login(user);
    ElMessage.success('注册成功');
    router.push('/'); // 跳转到首页
  } catch (error) {
    // 错误信息由Axios拦截器处理
  }
};
</script>

<style lang="less" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;

  .register-box {
    width: 400px;
    padding: 30px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);

    .register-btn {
      width: 100%;
    }

    .to-login {
      text-align: center;
      margin-top: 15px;
      color: #666;
      span {
        color: #42b983;
        cursor: pointer;
      }
    }
  }
}
</style>
```

#### 2. Pinia 全局状态管理（用户状态）

##### （1）定义用户 Store（src/store/user.ts）

typescript











```typescript
import { defineStore } from 'pinia';
import { User } from '@/types/user';

// 定义用户状态
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as User | null, // 用户信息
    isLogin: false // 是否登录
  }),
  actions: {
    // 登录（更新状态）
    login(user: User) {
      this.userInfo = user;
      this.isLogin = true;
      // 持久化到localStorage（刷新页面不丢失）
      localStorage.setItem('userInfo', JSON.stringify(user));
    },
    // 退出登录
    logout() {
      this.userInfo = null;
      this.isLogin = false;
      localStorage.removeItem('userInfo');
    },
    // 初始化（页面加载时从localStorage恢复状态）
    init() {
      const userStr = localStorage.getItem('userInfo');
      if (userStr) {
        this.userInfo = JSON.parse(userStr);
        this.isLogin = true;
      }
    }
  }
});
```

##### （2）在入口文件初始化状态（src/main.ts）

typescript











```typescript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
const pinia = createPinia();

// 初始化用户状态
import { useUserStore } from './store/user';
app.use(pinia);
const userStore = useUserStore();
userStore.init();

app.use(router)
   .use(ElementPlus)
   .mount('#app');
```

#### 3. 商品分类导航（前后端）

##### （1）需求分析

- 首页顶部展示一级分类（如 “水果”“蔬菜”“肉类”），点击切换分类。
- 分类数据按排序字段（sort）升序展示，确保顺序固定。

##### （2）后端实现

###### ① 分类实体类（Category.java）

java











```java
package com.rabbit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

@Data
public class Category {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name; // 分类名称
    private String icon; // 分类图标URL
    private Integer sort; // 排序（数字越小越靠前）
    @TableField("parent_id")
    private Long parentId; // 父分类ID（0=一级分类）
}
```

###### ② 分类 Service 与 Controller

java











```java
// CategoryService.java
public interface CategoryService extends IService<Category> {
    R<List<Category>> getFirstLevelCategories(); // 获取一级分类
}

// CategoryServiceImpl.java
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {
    @Override
    public R<List<Category>> getFirstLevelCategories() {
        // 查询一级分类（parent_id=0），按sort升序
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getParentId, 0)
                    .orderByAsc(Category::getSort);
        List<Category> categories = baseMapper.selectList(queryWrapper);
        return R.success(categories);
    }
}

// CategoryController.java
@RestController
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    // 获取一级分类
    @GetMapping("/category/first-level")
    public R<List<Category>> getFirstLevelCategories() {
        return categoryService.getFirstLevelCategories();
    }
}
```

##### （3）前端实现

###### ① 分类 API（src/api/category.ts）

typescript











```typescript
import request from './request';

// 获取一级分类
export const getFirstLevelCategoriesApi = () => {
  return request.get('/category/first-level');
};
```

###### ② 分类导航组件（src/components/CategoryNav.vue）

vue











```vue
<template>
  <div class="category-nav">
    <div 
      class="category-item" 
      v-for="category in categories" 
      :key="category.id"
      :class="{ active: currentCategoryId === category.id }"
      @click="handleCategoryClick(category.id)"
    >
      <img :src="category.icon" :alt="category.name" class="category-icon">
      <span>{{ category.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getFirstLevelCategoriesApi } from '@/api/category';
import { Category } from '@/types/category';

// 接收父组件的当前分类ID（默认0表示全部）
const props = defineProps<{
  currentCategoryId: number;
}>();

// 分类列表
const categories = ref<Category[]>([]);

// 加载分类数据
onMounted(async () => {
  const data = await getFirstLevelCategoriesApi();
  categories.value = data;
});

// 点击分类，触发父组件更新
const emit = defineEmits<{
  (e: 'change', categoryId: number): void;
}>();

const handleCategoryClick = (id: number) => {
  emit('change', id);
};
</script>

<style lang="less" scoped>
.category-nav {
  display: flex;
  padding: 10px 0;
  overflow-x: auto; // 支持横向滚动
  background: white;

  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    margin: 0 10px;
    cursor: pointer;

    .category-icon {
      width: 30px;
      height: 30px;
      margin-bottom: 5px;
    }

    &.active {
      color: #ff4d4f; // 选中状态颜色
      font-weight: bold;
    }
  }
}
</style>
```

#### 4. 公共导航栏组件（Navbar）

vue











```vue
<template>
  <div class="navbar">
    <div class="logo" @click="$router.push('/')">
      <img src="/static/logo.png" alt="小兔鲜儿">
    </div>
    <div class="search-box">
      <input type="text" placeholder="搜索商品..." @click="$router.push('/search')">
    </div>
    <div class="user-actions">
      <span @click="$router.push('/cart')" class="action-icon">
        <el-icon><ShoppingCart /></el-icon>
      </span>
      <span 
        @click="handleUserClick" 
        class="action-icon"
      >
        <el-icon><User /></el-icon>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { User, ShoppingCart } from '@element-plus/icons-vue';
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

// 用户点击事件（登录/未登录状态不同）
const handleUserClick = () => {
  if (userStore.isLogin) {
    // 已登录：跳转到个人中心
    router.push('/user/profile');
  } else {
    // 未登录：跳转到登录页
    router.push('/login');
  }
};
</script>

<style lang="less" scoped>
.navbar {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 15px;
  background: white;
  border-bottom: 1px solid #eee;

  .logo {
    width: 120px;
    img {
      width: 100%;
      height: 40px;
      object-fit: contain;
    }
  }

  .search-box {
    flex: 1;
    margin: 0 20px;
    input {
      width: 100%;
      height: 36px;
      padding: 0 15px;
      border: 1px solid #ddd;
      border-radius: 18px;
      outline: none;
      &:focus {
        border-color: #42b983;
      }
    }
  }

  .user-actions {
    display: flex;
    gap: 20px;

    .action-icon {
      font-size: 20px;
      color: #666;
      cursor: pointer;
      &:hover {
        color: #42b983;
      }
    }
  }
}
</style>
```

#### 5. 路由守卫（控制登录权限）

typescript











```typescript
// src/router/index.ts
import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import Login from '@/pages/Login.vue';
import Register from '@/pages/Register.vue';
import Home from '@/pages/Home.vue';
import { useUserStore } from '@/store/user';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/', name: 'Home', component: Home },
  { path: '/user/profile', name: 'UserProfile', component: () => import('@/pages/user/Profile.vue') } // 需要登录的页面
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const userStore = useUserStore();
  // 需要登录的页面（可配置白名单）
  const needLoginPaths = ['/user/profile'];

  if (needLoginPaths.includes(to.path) && !userStore.isLogin) {
    // 未登录，跳转到登录页，并记录目标路径（登录后跳转回来）
    next(`/login?redirect=${to.path}`);
  } else {
    next(); // 已登录或无需登录，直接放行
  }
});

export default router;
```

### 四、Day2 功能串联与测试

1. **注册流程**：访问`/register` → 填写表单（用户名、密码、手机号）→ 提交注册 → 自动登录 → 跳转到首页（导航栏显示用户状态）。
2. **分类导航**：首页加载后，`CategoryNav`组件请求一级分类数据 → 展示分类图标和名称 → 点击分类触发首页商品列表更新（后续 Day3 实现）。
3. **权限控制**：未登录状态访问`/user/profile` → 路由守卫拦截 → 自动跳转到`/login?redirect=/user/profile` → 登录后自动跳转到个人中心。

### 总结

Day2 通过以下功能完善了项目基础：

1. **用户体系**：注册功能 + Pinia 状态管理，实现登录状态全局共享。
2. **商品导航**：分类数据查询与前端展示，为商品筛选打下基础。
3. **组件化**：封装`CategoryNav`、`Navbar`等公共组件，提升代码复用性。
4. **权限控制**：路由守卫确保未登录用户无法访问受限页面，优化用户体验。

这些功能为后续的 “商品筛选”“购物车”“个人中心” 等模块提供了核心支撑。