# CMake 最低版本要求
cmake_minimum_required(VERSION 3.10)

# 项目名称和支持的语言
project(reliable_byte_stream LANGUAGES CXX)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 添加编译选项：启用所有警告，将警告视为错误（提高代码质量）
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Werror -pedantic")

# 查找Google Test库
find_package(GTest REQUIRED)

# 构建可靠字节流库（将核心逻辑封装为库，方便测试程序链接）
add_library(reliable_byte_stream_lib
        reliable_byte_stream.cpp
        reliable_byte_stream.h
)

# 设置库的包含目录（确保测试程序能找到头文件）
target_include_directories(reliable_byte_stream_lib
        PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}
)

# 构建单元测试可执行程序
add_executable(reliable_byte_stream_test
        reliable_byte_stream_test.cpp
)

# 链接测试程序所需的库：Google Test和我们的字节流库
target_link_libraries(reliable_byte_stream_test
        PRIVATE
        reliable_byte_stream_lib
        GTest::GTest
        GTest::Main
)

# 启用测试功能（允许使用ctest命令运行测试）
enable_testing()

# 将测试程序添加到测试列表
add_test(
        NAME reliable_byte_stream_tests
        COMMAND reliable_byte_stream_test
)

# 可选：添加一个目标用于运行Valgrind检测内存泄漏
if(VALGRIND)
    find_program(VALGRIND_EXE valgrind)
    if(VALGRIND_EXE)
        add_custom_target(valgrind_test
                COMMAND ${VALGRIND_EXE} --leak-check=full --show-leak-kinds=all $<TARGET_FILE:reliable_byte_stream_test>
                DEPENDS reliable_byte_stream_test
                COMMENT "Running Valgrind to check for memory leaks"
        )
    endif()
endif()
