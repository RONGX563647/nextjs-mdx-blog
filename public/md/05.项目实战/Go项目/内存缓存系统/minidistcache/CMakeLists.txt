# 最低支持的CMake版本（兼容大多数系统）
cmake_minimum_required(VERSION 3.10)

# 项目名称和语言
project(minidistcache LANGUAGES C)

# 设置C标准（必须为C99或更高，匹配代码中的语法）
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)

# 编译选项：开启所有警告（帮助发现代码问题），添加调试信息
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -g")

# 头文件目录（关键：告诉编译器去哪里找minidistcache.h）
include_directories(
        ${PROJECT_SOURCE_DIR}/include  # 假设头文件在include目录
        ${PROJECT_SOURCE_DIR}/src      # 如果头文件和源文件在一起，添加这个
)

# 源文件列表（必须包含所有.c文件，否则会报"未定义函数"错误）
set(SOURCES
        src/main.c
        src/utils.c
        src/config.c
        src/ds.c       # 之前报错的ds.c必须包含
        src/persist.c
        src/server.c
        src/client.c
)

# 生成可执行文件
add_executable(${PROJECT_NAME} ${SOURCES})

# 链接线程库（解决pthread相关函数未定义问题）
find_package(Threads REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE Threads::Threads)

# 可选：设置输出目录
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_BINARY_DIR}/bin)

# 打印配置信息（确认路径是否正确）
message(STATUS "头文件搜索路径: ${INCLUDE_DIRECTORIES}")
message(STATUS "源文件列表: ${SOURCES}")
message(STATUS "链接的库: Threads::Threads")
