# ========================= 基础配置 =========================
# 编译器与编译选项
CC := gcc
# 编译选项：-Wall/-Wextra（警告）、-g（调试符号）、-O2（优化）、-std=c99（C标准）
CFLAGS := -Wall -Wextra -g -O2 -std=c99
# 链接选项：链接pthread线程库（多线程支持）
LDFLAGS := -lpthread
# 目标可执行文件名
TARGET := minidistcache

# ========================= 目录配置 =========================
# 源文件目录（.c文件存放位置，可根据实际结构修改）
SRC_DIR := src
# 头文件目录（.h文件存放位置，告诉编译器去哪里找头文件）
INC_DIR := include
# 目标文件目录（.o文件存放位置，避免与源文件混叠）
OBJ_DIR := obj
# 可执行文件目录（最终生成的程序存放位置）
BIN_DIR := bin

# ========================= 文件列表 =========================
# 查找SRC_DIR下所有.c文件（递归查找子目录，适应复杂结构）
SRCS := $(wildcard $(SRC_DIR)/*.c)
# 将SRC_DIR下的.c文件路径替换为OBJ_DIR下的.o文件（如src/main.c → obj/main.o）
OBJS := $(patsubst $(SRC_DIR)/%.c, $(OBJ_DIR)/%.o, $(SRCS))
# 头文件列表（用于依赖检测，修改头文件后自动重新编译）
HDRS := $(wildcard $(INC_DIR)/*.h)

# ========================= 默认目标 =========================
# .PHONY：声明目标是“伪目标”，避免与同名文件冲突（如clean、all）
.PHONY: all clean

# 默认目标：先创建输出目录，再生成可执行文件
all: $(BIN_DIR)/$(TARGET)
	@echo "✅ 编译完成！可执行文件：$(BIN_DIR)/$(TARGET)"

# ========================= 编译规则 =========================
# 1. 生成可执行文件：链接所有.o文件
$(BIN_DIR)/$(TARGET): $(OBJS) | $(BIN_DIR)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)
	@echo "🔗 链接目标文件生成可执行文件"

# 2. 生成.o文件：编译每个.c文件（依赖对应的.c文件和所有头文件）
# $<：当前依赖的.c文件（如src/main.c）
# $@：当前目标的.o文件（如obj/main.o）
# -I$(INC_DIR)：指定头文件搜索路径，避免#include "xxx.h"报错
$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c $(HDRS) | $(OBJ_DIR)
	$(CC) $(CFLAGS) -I$(INC_DIR) -c -o $@ $<
	@echo "📦 编译 $< → $@"

# ========================= 目录创建规则 =========================
# 自动创建OBJ_DIR和BIN_DIR（如果不存在）
# | 表示“顺序依赖”：先创建目录，再执行后续规则
$(OBJ_DIR):
	mkdir -p $@
	@echo "📂 创建目标文件目录：$@"

$(BIN_DIR):
	mkdir -p $@
	@echo "📂 创建可执行文件目录：$@"

# ========================= 清理规则 =========================
# 清理所有编译产物（.o文件、可执行文件、日志/持久化文件）
clean:
	rm -rf $(OBJ_DIR) $(BIN_DIR)  # 删除目标文件和可执行文件目录
	rm -f cache.log cache.data    # 删除项目运行生成的日志/数据文件
	@echo "🗑️  清理完成！"