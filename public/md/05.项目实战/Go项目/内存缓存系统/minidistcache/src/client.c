#include "minidistcache.h"

// 启动客户端（发送命令到服务端）
void client_run(const char* server_ip, int port, const char* command) {
    if (!server_ip || !server_ip[0] || port < 1024 || port > 65535 || !command || !command[0]) {
        fprintf(stderr, "客户端参数错误：IP=%s，port=%d，command=%s\n", server_ip, port, command);
        return;
    }

    // 创建TCP socket
    int sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (sock_fd < 0) {
        fprintf(stderr, "客户端失败：socket创建失败\n");
        return;
    }

    // 设置服务端地址
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(port);

    // 转换IP地址（域名或IPv4）
    if (inet_pton(AF_INET, server_ip, &server_addr.sin_addr) <= 0) {
        fprintf(stderr, "客户端失败：无效的服务器IP=%s\n", server_ip);
        close(sock_fd);
        return;
    }

    // 连接服务端
    if (connect(sock_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        fprintf(stderr, "客户端失败：连接服务器%s:%d失败\n", server_ip, port);
        close(sock_fd);
        return;
    }

    printf("客户端：连接服务器%s:%d成功，发送命令：%s\n", server_ip, port, command);

    // 发送命令
    ssize_t n = write(sock_fd, command, strlen(command));
    if (n <= 0) {
        fprintf(stderr, "客户端失败：发送命令失败\n");
        close(sock_fd);
        return;
    }

    // 接收响应
    char buffer[4096] = {0};
    n = read(sock_fd, buffer, sizeof(buffer)-1);
    if (n <= 0) {
        fprintf(stderr, "客户端失败：接收响应失败\n");
    } else {
        printf("客户端：服务端响应：%s\n", buffer);
    }

    // 关闭连接
    close(sock_fd);
    printf("客户端：连接关闭\n");
}