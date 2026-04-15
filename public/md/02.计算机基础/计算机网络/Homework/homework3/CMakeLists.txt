cmake_minimum_required(VERSION 3.10)
project(tcp_sender LANGUAGES C)

# 设置C标准（C99及以上，支持void无参数函数）
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

# 编译选项：启用警告，不将警告视为错误（避免非致命警告导致编译失败）
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -pedantic")

# 1. 构建TCP发送端核心库（包含tcp_sender.c的实现）
add_library(tcp_sender_lib
        tcp_sender.c
        tcp_sender.h
)

# 设置库的头文件路径（让测试程序能找到tcp_sender.h）
target_include_directories(tcp_sender_lib
        PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}
)

# 2. 构建测试程序（链接核心库）
add_executable(tcp_sender_test
        tcp_sender_test.c
)

# 3. 链接测试程序与核心库（关键：解决"undefined symbols"问题）
target_link_libraries(tcp_sender_test
        PRIVATE
        tcp_sender_lib
)

# 启用测试（支持make test命令）
enable_testing()
add_test(
        NAME tcp_sender_tests
        COMMAND tcp_sender_test
)