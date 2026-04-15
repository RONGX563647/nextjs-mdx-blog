cmake_minimum_required(VERSION 3.10)
project(webget LANGUAGES CXX)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 添加编译选项
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Werror")

# 创建可执行文件
add_executable(webget webget.cpp)

# 链接必要的库
target_link_libraries(webget PRIVATE pthread)
