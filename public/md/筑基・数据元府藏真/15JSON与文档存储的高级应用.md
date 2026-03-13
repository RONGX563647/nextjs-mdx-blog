# JSON与文档存储的高级应用

## 一、问题引入：动态表单存储难题

### 1.1 真实案例：企业表单系统的设计困境

```
场景：企业OA系统的表单设计器
需求：
- 人事部需要入职申请表（姓名、部门、薪资期望等）
- 财务部需要报销单（发票信息、费用明细等）
- IT部需要设备申请（设备类型、配置要求等）
- 每个部门表单字段完全不同

传统方案的问题：
┌─────────────────────────────────────────────────────────────┐
│ 方案1：为每个表单建独立表                                     │
│ - 表数量爆炸：100个表单 = 100张表                            │
│ - 维护困难：DDL变更需要修改100处                             │
│ - 查询复杂：无法统一查询所有表单数据                         │
├─────────────────────────────────────────────────────────────┤
│ 方案2：使用EAV模型（实体-属性-值）                           │
│ - 表结构：form_data(id, form_id, field_name, field_value)   │
│ - 查询极慢：一个表单需要JOIN多次                             │
│ - 类型丢失：所有值都是字符串                                 │
│ - 难以索引：无法对特定字段建索引                             │
├─────────────────────────────────────────────────────────────┤
│ 方案3：预留大量字段（col1, col2, ... col50）                 │
│ - 字段含义不明确                                             │
│ - 超过50个字段就无法满足                                     │
│ - 空间浪费：大部分字段为空                                   │
└─────────────────────────────────────────────────────────────┘

最终方案：MySQL JSON类型 + 虚拟列索引
- 动态字段存储在JSON中
- 常用查询字段建立虚拟列索引
- 兼顾灵活性和性能
```

### 1.2 JSON存储的应用场景

| 场景 | 说明 | 示例 |
|-----|------|------|
| 动态表单 | 字段不固定的业务表单 | 审批流、问卷系统 |
| 商品属性 | SKU属性差异大 | 手机vs服装的属性完全不同 |
| 用户画像 | 标签体系动态扩展 | 用户标签、行为数据 |
| 配置信息 | 结构化配置数据 | 系统配置、规则引擎 |
| 日志数据 | 半结构化日志 | 操作日志、审计日志 |
| 多语言内容 | 多语言字段存储 | 商品名称、描述的多语言版本 |

## 二、MySQL JSON类型深度解析

### 2.1 JSON数据类型特性

```
MySQL 5.7.8+ 引入JSON类型，8.0进一步优化：

┌──────────────────────────────────────────────────────────────┐
│ 特性                          │ 说明                         │
├───────────────────────────────┼──────────────────────────────┤
│ 二进制存储                    │ 解析后存储，避免重复解析     │
│ 部分更新                      │ 8.0支持原地更新，非全量替换  │
│ 虚拟列索引                    │ 可基于JSON路径创建索引       │
│ 多值索引                      │ 8.0.17+支持JSON数组索引      │
│ 约束检查                      │ 可配合CHECK约束验证JSON结构  │
│ 函数丰富                      │ 提供完整的JSON操作函数集     │
└───────────────────────────────┴──────────────────────────────┘

存储格式对比：
- TEXT存储JSON：原始文本，每次查询需要解析
- JSON类型：二进制格式（BSON-like），已解析存储
  - 更快的读取速度
  - 更高效的存储空间
  - 支持部分更新（8.0）
```

### 2.2 基础DDL操作

```sql
-- 创建JSON表
CREATE TABLE dynamic_form (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    form_code VARCHAR(50) NOT NULL COMMENT '表单编码',
    form_name VARCHAR(100) NOT NULL COMMENT '表单名称',
    form_data JSON NOT NULL COMMENT '表单数据',
    created_by BIGINT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 虚拟列（从JSON中提取）
    user_id BIGINT AS (JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.userId'))) STORED,
    form_status TINYINT AS (JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.status'))) STORED,
    
    -- 索引
    INDEX idx_form_code (form_code),
    INDEX idx_user_id (user_id),
    INDEX idx_status (form_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='动态表单表';

-- 插入JSON数据
INSERT INTO dynamic_form (form_code, form_name, form_data, created_by) VALUES 
('ENTRY_001', '入职申请表', '{
    "userId": 10001,
    "name": "张三",
    "department": "技术部",
    "position": "Java工程师",
    "salaryExpect": 25000,
    "status": 1,
    "skills": ["Java", "MySQL", "Redis", "Spring Boot"],
    "experience": [
        {"company": "A科技", "years": 2, "position": "初级开发"},
        {"company": "B互联", "years": 3, "position": "高级开发"}
    ],
    "education": {
        "school": "某某大学",
        "major": "计算机科学",
        "degree": "本科"
    },
    "emergencyContact": {
        "name": "张三父亲",
        "phone": "13800138000",
        "relation": "父子"
    }
}', 1);

-- 批量插入
INSERT INTO dynamic_form (form_code, form_name, form_data) VALUES 
('EXPENSE_001', '差旅报销单', '{
    "userId": 10002,
    "amount": 3580.50,
    "status": 0,
    "items": [
        {"type": "交通", "amount": 1200, "invoice": "INV001"},
        {"type": "住宿", "amount": 1800, "invoice": "INV002"},
        {"type": "餐饮", "amount": 580.50, "invoice": "INV003"}
    ]
}'),
('DEVICE_001', '设备申请单', '{
    "userId": 10003,
    "deviceType": "笔记本",
    "brand": "ThinkPad",
    "model": "X1 Carbon",
    "config": {
        "cpu": "i7-1165G7",
        "ram": "16GB",
        "ssd": "512GB"
    },
    "reason": "开发工作需要",
    "status": 1
}');
```

### 2.3 JSON查询操作详解

```sql
-- 1. 基础查询：提取JSON字段
SELECT 
    id,
    form_name,
    JSON_EXTRACT(form_data, '$.name') AS name,
    JSON_EXTRACT(form_data, '$.department') AS department,
    JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.position')) AS position
FROM dynamic_form
WHERE form_code = 'ENTRY_001';

-- 简写语法（-> 和 ->>）
SELECT 
    id,
    form_data->>'$.name' AS name,           -- 返回字符串（自动UNQUOTE）
    form_data->'$.salaryExpect' AS salary,  -- 返回JSON格式
    form_data->>'$.education.school' AS school,  -- 嵌套对象访问
    form_data->>'$.emergencyContact.phone' AS emergency_phone
FROM dynamic_form;

-- 2. 条件查询
-- 查询技术部的入职申请
SELECT * FROM dynamic_form 
WHERE form_code = 'ENTRY_001'
  AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.department')) = '技术部';

-- 使用虚拟列索引（推荐）
SELECT * FROM dynamic_form 
WHERE form_code = 'ENTRY_001'
  AND form_status = 1;

-- 3. JSON数组查询
-- 查询具备Java技能的申请人
SELECT * FROM dynamic_form 
WHERE form_code = 'ENTRY_001'
  AND JSON_CONTAINS(form_data, '"Java"', '$.skills');

-- 查询有3年以上工作经验的人
SELECT * FROM dynamic_form 
WHERE form_code = 'ENTRY_001'
  AND JSON_OVERLAPS(
    JSON_EXTRACT(form_data, '$.experience[*].years'),
    CAST('[3, 4, 5, 6, 7, 8, 9, 10]' AS JSON)
  );

-- 4. JSON路径搜索
-- 查询所有包含手机号字段的表单
SELECT * FROM dynamic_form 
WHERE JSON_CONTAINS_PATH(form_data, 'one', '$.emergencyContact.phone');

-- 查询所有包含items数组的报销单
SELECT * FROM dynamic_form 
WHERE JSON_CONTAINS_PATH(form_data, 'one', '$.items');

-- 5. JSON聚合查询
-- 统计各部门入职申请数量
SELECT 
    JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.department')) AS department,
    COUNT(*) AS count
FROM dynamic_form 
WHERE form_code = 'ENTRY_001'
GROUP BY JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.department'));

-- 6. JSON表函数（8.0+）将JSON数组转为行
SELECT 
    f.id,
    f.form_name,
    jt.company,
    jt.years
FROM dynamic_form f,
JSON_TABLE(
    f.form_data,
    '$.experience[*]'
    COLUMNS (
        company VARCHAR(100) PATH '$.company',
        years INT PATH '$.years'
    )
) AS jt
WHERE f.form_code = 'ENTRY_001';
```

### 2.4 JSON索引优化策略

```sql
-- 策略1：虚拟列 + 索引（推荐）
-- 为常用查询字段创建虚拟列和索引
ALTER TABLE dynamic_form 
ADD COLUMN v_salary DECIMAL(10,2) 
    GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.salaryExpect'))) STORED,
ADD INDEX idx_salary (v_salary);

-- 策略2：多值索引（MySQL 8.0.17+）
-- 为JSON数组创建多值索引
ALTER TABLE dynamic_form 
ADD INDEX idx_skills ((CAST(form_data->'$.skills' AS CHAR(50) ARRAY)));

-- 使用多值索引查询
SELECT * FROM dynamic_form 
WHERE 'Java' MEMBER OF(form_data->'$.skills');

-- 策略3：函数索引（8.0.13+）
ALTER TABLE dynamic_form 
ADD INDEX idx_name ((JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.name'))));

-- 策略4：复合索引
ALTER TABLE dynamic_form 
ADD INDEX idx_dept_status (user_id, form_status);

-- 索引使用分析
EXPLAIN SELECT * FROM dynamic_form 
WHERE form_code = 'ENTRY_001'
  AND user_id = 10001;
-- 应显示使用了 idx_user_id 或 idx_dept_status 索引
```

## 三、Java操作JSON完整方案

### 3.1 JPA实体映射

```java
/**
 * 动态表单实体
 */
@Entity
@Table(name = "dynamic_form")
@Data
public class DynamicForm {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "form_code", length = 50)
    private String formCode;
    
    @Column(name = "form_name", length = 100)
    private String formName;
    
    // JSON字段映射
    @Convert(converter = JsonConverter.class)
    @Column(name = "form_data", columnDefinition = "json")
    private Map<String, Object> formData;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 虚拟列映射（只读）
    @Formula("JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.userId'))")
    private Long userId;
    
    @Formula("JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.status'))")
    private Integer status;
    
    @Formula("JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.name'))")
    private String applicantName;
}

/**
 * JSON转换器
 */
@Converter
public class JsonConverter implements AttributeConverter<Map<String, Object>, String> {
    
    private static final ObjectMapper objectMapper = new ObjectMapper()
        .setSerializationInclusion(JsonInclude.Include.NON_NULL)
        .registerModule(new JavaTimeModule());
    
    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON序列化失败", e);
        }
    }
    
    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (StringUtils.isBlank(dbData)) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON反序列化失败", e);
        }
    }
}
```

### 3.2 MyBatis操作JSON

```java
/**
 * MyBatis JSON类型处理器
 */
@Component
public class JsonTypeHandler extends BaseTypeHandler<Map<String, Object>> {
    
    private static final ObjectMapper mapper = new ObjectMapper();
    
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, 
            Map<String, Object> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setString(i, mapper.writeValueAsString(parameter));
        } catch (JsonProcessingException e) {
            throw new SQLException("JSON转换失败", e);
        }
    }
    
    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, String columnName) 
            throws SQLException {
        return parseJson(rs.getString(columnName));
    }
    
    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, int columnIndex) 
            throws SQLException {
        return parseJson(rs.getString(columnIndex));
    }
    
    @Override
    public Map<String, Object> getNullableResult(CallableStatement cs, int columnIndex) 
            throws SQLException {
        return parseJson(cs.getString(columnIndex));
    }
    
    private Map<String, Object> parseJson(String json) {
        if (StringUtils.isBlank(json)) {
            return new HashMap<>();
        }
        try {
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON解析失败", e);
        }
    }
}

/**
 * Mapper接口
 */
@Mapper
public interface DynamicFormMapper {
    
    @Insert("INSERT INTO dynamic_form (form_code, form_name, form_data, created_by) " +
            "VALUES (#{formCode}, #{formName}, #{formData, typeHandler=com.example.JsonTypeHandler}, #{createdBy})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(DynamicForm form);
    
    @Select("SELECT * FROM dynamic_form WHERE id = #{id}")
    @Results({
        @Result(property = "formData", column = "form_data", 
                typeHandler = JsonTypeHandler.class)
    })
    DynamicForm selectById(Long id);
    
    @Select("<script>" +
            "SELECT * FROM dynamic_form " +
            "WHERE form_code = #{formCode} " +
            "<if test='userId != null'> " +
            "  AND JSON_EXTRACT(form_data, '$.userId') = #{userId} " +
            "</if>" +
            "<if test='department != null'> " +
            "  AND JSON_EXTRACT(form_data, '$.department') = #{department} " +
            "</if>" +
            "ORDER BY created_at DESC" +
            "</script>")
    List<DynamicForm> selectByCondition(@Param("formCode") String formCode,
                                        @Param("userId") Long userId,
                                        @Param("department") String department);
    
    @Update("UPDATE dynamic_form SET " +
            "form_data = JSON_SET(form_data, '$.status', #{status}) " +
            "WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
```

### 3.3 JSON动态查询构建

```java
/**
 * JSON动态查询服务
 */
@Service
@Slf4j
public class JsonQueryService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 构建动态JSON查询
     */
    public List<Map<String, Object>> dynamicQuery(String formCode, 
                                                   Map<String, Object> conditions) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT id, form_code, form_name, form_data, created_at ");
        sql.append("FROM dynamic_form WHERE form_code = ?");
        
        List<Object> params = new ArrayList<>();
        params.add(formCode);
        
        // 动态添加JSON条件
        int index = 0;
        for (Map.Entry<String, Object> entry : conditions.entrySet()) {
            String field = entry.getKey();
            Object value = entry.getValue();
            
            if (value instanceof String) {
                sql.append(" AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.")
                  .append(field).append("')) = ?");
                params.add(value);
            } else if (value instanceof Number) {
                sql.append(" AND JSON_EXTRACT(form_data, '$.")
                  .append(field).append("') = ?");
                params.add(value);
            } else if (value instanceof List) {
                // 数组包含查询
                sql.append(" AND JSON_CONTAINS(form_data, ?, '$.")
                  .append(field).append("')");
                params.add(JSON.toJSONString(value));
            }
        }
        
        sql.append(" ORDER BY created_at DESC");
        
        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }
    
    /**
     * JSON路径查询
     */
    public List<Map<String, Object>> queryByJsonPath(String jsonPath, Object value) {
        String sql = "SELECT * FROM dynamic_form " +
                     "WHERE JSON_EXTRACT(form_data, ?) = ?";
        return jdbcTemplate.queryForList(sql, jsonPath, value);
    }
    
    /**
     * 聚合查询
     */
    public List<Map<String, Object>> aggregateByField(String formCode, String field) {
        String sql = String.format(
            "SELECT JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.%s')) AS %s, COUNT(*) AS cnt " +
            "FROM dynamic_form WHERE form_code = ? " +
            "GROUP BY JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.%s'))",
            field, field, field
        );
        return jdbcTemplate.queryForList(sql, formCode);
    }
}
```

## 四、文档存储方案对比

### 4.1 MySQL JSON vs MongoDB

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MySQL JSON vs MongoDB 对比                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  特性                    │ MySQL JSON          │ MongoDB            │
│  ────────────────────────┼─────────────────────┼────────────────────│
│  事务支持                │ ✅ 完整ACID         │ ✅ 4.0+支持多文档  │
│  关联查询                │ ✅ JOIN支持         │ ❌ 需应用层处理    │
│  复杂查询                │ ✅ SQL强大          │ ⚠️ 聚合管道学习曲线│
│  水平扩展                │ ❌ 需手动分片       │ ✅ 原生分片支持    │
│  写入性能                │ ⚠️ 中等             │ ✅ 高              │
│  存储效率                │ ⚠️ 二进制JSON       │ ✅ BSON更高效      │
│  运维复杂度              │ ✅ 低（现有MySQL）  │ ⚠️ 需额外学习      │
│  生态工具                │ ✅ 丰富             │ ✅ 丰富            │
│                                                                     │
│  选择建议：                                                         │
│  - 已有MySQL架构，JSON只是部分字段 → MySQL JSON                    │
│  - 纯文档场景，高写入，需水平扩展 → MongoDB                        │
│  - 需要事务和复杂关联 → MySQL JSON                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 混合存储架构

```java
/**
 * 混合存储服务 - MySQL存核心数据，MongoDB存文档
 */
@Service
@Slf4j
public class HybridStorageService {
    
    @Autowired
    private ProductRepository productRepository; // JPA - MySQL
    
    @Autowired
    private MongoTemplate mongoTemplate; // MongoDB
    
    /**
     * 保存商品 - 核心数据存MySQL，详情存MongoDB
     */
    public void saveProduct(Product product, Map<String, Object> detail) {
        // 1. 保存核心数据到MySQL
        Product saved = productRepository.save(product);
        
        // 2. 保存详情到MongoDB
        Document doc = new Document();
        doc.put("productId", saved.getId());
        doc.put("detail", detail);
        doc.put("updateTime", new Date());
        
        mongoTemplate.save(doc, "product_detail");
    }
    
    /**
     * 查询商品 - 关联查询
     */
    public ProductVO getProduct(Long productId) {
        // 1. 查MySQL核心数据
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        // 2. 查MongoDB详情
        Query query = Query.query(Criteria.where("productId").is(productId));
        Document detail = mongoTemplate.findOne(query, Document.class, "product_detail");
        
        // 3. 组装返回
        ProductVO vo = new ProductVO();
        BeanUtils.copyProperties(product, vo);
        if (detail != null) {
            vo.setDetail((Map<String, Object>) detail.get("detail"));
        }
        
        return vo;
    }
}
```

## 五、性能优化与最佳实践

### 5.1 JSON性能优化清单

```
┌─────────────────────────────────────────────────────────────────────┐
│                      JSON性能优化清单                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  【存储优化】                                                       │
│  □ 1. JSON大小控制在1MB以内（单条记录）                            │
│  □ 2. 避免深层嵌套（建议不超过5层）                                │
│  □ 3. 数组元素数量控制在1000以内                                   │
│  □ 4. 大文本字段单独存储，JSON中只存引用                           │
│                                                                     │
│  【索引优化】                                                       │
│  □ 1. 常用查询字段建立虚拟列索引                                   │
│  □ 2. 数组查询使用多值索引（8.0.17+）                              │
│  □ 3. 避免在低基数字段上建索引                                     │
│  □ 4. 定期分析索引使用情况，删除无用索引                           │
│                                                                     │
│  【查询优化】                                                       │
│  □ 1. 优先使用虚拟列而非JSON_EXTRACT                               │
│  □ 2. 避免在WHERE中使用JSON函数（无法使用索引）                    │
│  □ 3. 大数据量分页查询使用覆盖索引                                 │
│  □ 4. 复杂JSON查询考虑应用层处理                                   │
│                                                                     │
│  【写入优化】                                                       │
│  □ 1. 使用批量插入减少网络往返                                     │
│  □ 2. 8.0+利用部分更新特性                                         │
│  □ 3. 避免频繁更新大JSON字段                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 常见陷阱与解决方案

| 陷阱 | 问题 | 解决方案 |
|-----|------|---------|
| 全表扫描 | JSON字段查询不走索引 | 建立虚拟列索引 |
| 类型转换 | JSON数字与字符串混用 | 统一类型，使用CAST转换 |
| 更新覆盖 | 更新JSON时覆盖其他字段 | 使用JSON_SET/JSON_REPLACE |
| 字符集 | JSON中文乱码 | 确保表使用utf8mb4 |
| 大JSON | 单条记录过大 | 拆分存储，大字段分离 |
| 无约束 | JSON结构不统一 | 使用CHECK约束或应用层校验 |

### 5.3 JSON更新操作

```sql
-- 部分更新（8.0+支持原地更新）
-- 修改单个字段
UPDATE dynamic_form 
SET form_data = JSON_SET(form_data, '$.status', 2)
WHERE id = 1;

-- 修改嵌套字段
UPDATE dynamic_form 
SET form_data = JSON_SET(form_data, '$.education.degree', '硕士')
WHERE id = 1;

-- 添加数组元素
UPDATE dynamic_form 
SET form_data = JSON_ARRAY_APPEND(form_data, '$.skills', 'Docker')
WHERE id = 1;

-- 删除字段
UPDATE dynamic_form 
SET form_data = JSON_REMOVE(form_data, '$.emergencyContact')
WHERE id = 1;

-- 合并JSON（8.0+）
UPDATE dynamic_form 
SET form_data = JSON_MERGE_PATCH(form_data, '{"status": 3, "approveTime": "2024-01-15"}')
WHERE id = 1;
```

## 六、实战案例：表单设计器实现

### 6.1 表单设计器架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                      表单设计器架构                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐   │
│  │  前端设计器  │────▶│  表单定义   │────▶│   动态表单渲染      │   │
│  │  (Vue/React)│     │  (JSON Schema)│   │   (表单引擎)        │   │
│  └─────────────┘     └─────────────┘     └─────────────────────┘   │
│         │                   │                      │                │
│         │                   │                      ▼                │
│         │                   │           ┌─────────────────────┐     │
│         │                   │           │   MySQL JSON存储    │     │
│         │                   │           │   - form_definition │     │
│         │                   │           │   - form_data       │     │
│         │                   │           └─────────────────────┘     │
│         │                   │                                        │
│         ▼                   ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    表单字段定义示例                          │   │
│  │  {                                                          │   │
│  │    "fields": [                                              │   │
│  │      {"name": "name", "type": "text", "required": true},   │   │
│  │      {"name": "age", "type": "number", "min": 18},         │   │
│  │      {"name": "department", "type": "select",               │   │
│  │       "options": ["技术", "产品", "运营"]},                  │   │
│  │      {"name": "skills", "type": "checkbox",                 │   │
│  │       "options": ["Java", "Python", "Go"]}                   │   │
│  │    ]                                                        │   │
│  │  }                                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 表单引擎核心代码

```java
/**
 * 动态表单引擎
 */
@Service
@Slf4j
public class FormEngineService {
    
    @Autowired
    private FormDefinitionRepository definitionRepository;
    
    @Autowired
    private FormDataRepository formDataRepository;
    
    /**
     * 创建表单定义
     */
    public FormDefinition createFormDefinition(String formCode, String formName, 
                                                List<FormField> fields) {
        FormDefinition definition = new FormDefinition();
        definition.setFormCode(formCode);
        definition.setFormName(formName);
        definition.setFields(fields);
        definition.setVersion(1);
        definition.setCreatedAt(LocalDateTime.now());
        
        // 生成JSON Schema用于前端校验
        definition.setJsonSchema(generateJsonSchema(fields));
        
        return definitionRepository.save(definition);
    }
    
    /**
     * 提交表单数据
     */
    public FormData submitForm(String formCode, Map<String, Object> data) {
        // 1. 获取表单定义
        FormDefinition definition = definitionRepository
            .findByFormCodeAndLatestVersion(formCode)
            .orElseThrow(() -> new RuntimeException("表单不存在"));
        
        // 2. 数据校验
        validateFormData(definition.getFields(), data);
        
        // 3. 保存数据
        FormData formData = new FormData();
        formData.setFormCode(formCode);
        formData.setFormVersion(definition.getVersion());
        formData.setData(data);
        formData.setStatus(FormStatus.PENDING);
        formData.setCreatedAt(LocalDateTime.now());
        
        return formDataRepository.save(formData);
    }
    
    /**
     * 数据校验
     */
    private void validateFormData(List<FormField> fields, Map<String, Object> data) {
        for (FormField field : fields) {
            String fieldName = field.getName();
            Object value = data.get(fieldName);
            
            // 必填校验
            if (field.isRequired() && (value == null || "".equals(value))) {
                throw new ValidationException(fieldName + "不能为空");
            }
            
            // 类型校验
            if (value != null) {
                validateFieldType(field, value);
            }
            
            // 范围校验
            if (value instanceof Number && field.getMin() != null) {
                double num = ((Number) value).doubleValue();
                if (num < field.getMin()) {
                    throw new ValidationException(fieldName + "不能小于" + field.getMin());
                }
            }
        }
    }
    
    /**
     * 生成JSON Schema
     */
    private String generateJsonSchema(List<FormField> fields) {
        Map<String, Object> schema = new HashMap<>();
        schema.put("type", "object");
        
        Map<String, Object> properties = new HashMap<>();
        List<String> required = new ArrayList<>();
        
        for (FormField field : fields) {
            Map<String, Object> prop = new HashMap<>();
            prop.put("type", mapFieldType(field.getType()));
            prop.put("title", field.getLabel());
            
            if (field.getOptions() != null) {
                prop.put("enum", field.getOptions());
            }
            
            properties.put(field.getName(), prop);
            
            if (field.isRequired()) {
                required.add(field.getName());
            }
        }
        
        schema.put("properties", properties);
        schema.put("required", required);
        
        return JSON.toJSONString(schema);
    }
    
    private String mapFieldType(String formType) {
        switch (formType) {
            case "number":
            case "integer":
                return "number";
            case "checkbox":
            case "multiselect":
                return "array";
            case "boolean":
                return "boolean";
            default:
                return "string";
        }
    }
}
```

---

**系列上一篇**：[数据异构与同步方案](14数据异构与同步方案.md)

**系列下一篇**：[地理空间数据处理](16地理空间数据处理.md)
