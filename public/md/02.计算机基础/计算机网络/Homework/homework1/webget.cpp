// 包含必要的头文件：
// iostream：标准输入输出（如cout/cerr）
// string：字符串处理
// cstring：C风格字符串函数（如strerror、memset）
// sys/socket.h：socket系统调用（创建/连接/发送/接收）
// netdb.h：主机名解析（gethostbyname）
// arpa/inet.h：网络字节序转换（htons）
// unistd.h：系统调用（close、sleep等）
// fstream：文件读写（ofstream写文件）
// sstream：字符串流（辅助解析，本代码未直接使用但预留）
#include <iostream>
#include <string>
#include <cstring>
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <fstream>
#include <sstream>

/**
 * @brief 解析HTTP URL，提取主机名、端口号和请求路径
 * @param url 输入的HTTP URL（如"http://im.20jd.com/home/index"）
 * @param host 输出参数，存储解析出的主机名（如"im.20jd.com"）
 * @param port 输出参数，存储解析出的端口号（默认80）
 * @param path 输出参数，存储解析出的请求路径（默认"/"）
 * @return 解析成功返回true，失败返回false（如协议不支持）
 */
bool parse_url(const std::string& url, std::string& host, int& port, std::string& path) {
    // 1. 检查URL协议：仅支持HTTP（以"http://"开头）
    size_t start = 0;  // URL中主机名的起始位置
    if (url.substr(0, 7) == "http://") {
        start = 7;  // 跳过"http://"，从第7个字符开始解析主机名
    } else {
        std::cerr << "不支持的协议，仅支持HTTP" << std::endl;
        return false;
    }

    // 2. 查找关键位置：端口分隔符":"和路径分隔符"/"
    size_t colon_pos = url.find(':', start);  // 查找端口号的":"位置
    size_t slash_pos = url.find('/', start);  // 查找路径的"/"位置

    // 3. 确定主机名的结束位置（处理两种情况：带端口/不带端口）
    size_t host_end = url.size();  // 默认主机名到URL末尾（无端口无路径时）
    if (colon_pos != std::string::npos && (slash_pos == std::string::npos || colon_pos < slash_pos)) {
        // 情况1：URL带端口（如"http://example.com:8080/path"）
        host_end = colon_pos;  // 主机名到":"前结束
        // 提取端口号：从":"后到"/"前（或URL末尾）
        if (slash_pos != std::string::npos) {
            port = std::stoi(url.substr(colon_pos + 1, slash_pos - colon_pos - 1));
        } else {
            port = std::stoi(url.substr(colon_pos + 1));
        }
    } else {
        // 情况2：URL不带端口（默认HTTP端口80）
        port = 80;
        // 若有路径分隔符"/"，主机名到"/"前结束
        if (slash_pos != std::string::npos) {
            host_end = slash_pos;
        }
    }

    // 4. 提取主机名：从start到host_end的子串
    host = url.substr(start, host_end - start);

    // 5. 提取请求路径：有"/"则取其后内容，无则默认"/"（HTTP默认路径）
    if (slash_pos != std::string::npos) {
        path = url.substr(slash_pos);
    } else {
        path = "/";
    }

    return true;  // 解析成功
}

/**
 * @brief 确定下载文件的本地保存名称
 * @param url 输入的HTTP URL（用于从路径提取文件名）
 * @param response_headers HTTP响应头（用于从Content-Disposition提取文件名）
 * @return 本地保存的文件名（如"index.html"）
 */
std::string get_filename(const std::string& url, const std::string& response_headers) {
    // 优先级1：从响应头的Content-Disposition字段提取（服务器指定文件名）
    size_t disp_pos = response_headers.find("Content-Disposition:");  // 查找该字段位置
    if (disp_pos != std::string::npos) {
        size_t filename_pos = response_headers.find("filename=", disp_pos);  // 查找"filename="
        if (filename_pos != std::string::npos) {
            filename_pos += 9;  // 跳过"filename="（长度为9），指向文件名起始
            size_t end_pos = response_headers.find("\r\n", filename_pos);  // 查找字段结束符"\r\n"
            std::string filename = response_headers.substr(filename_pos, end_pos - filename_pos);
            // 去除文件名可能的引号（如"file.txt"→file.txt）
            if (!filename.empty() && (filename[0] == '"' || filename[0] == '\'')) {
                filename = filename.substr(1, filename.size() - 2);
            }
            return filename;  // 返回服务器指定的文件名
        }
    }

    // 优先级2：从URL路径中提取文件名（如"http://a.com/b/c.txt"→"c.txt"）
    size_t last_slash = url.find_last_of('/');  // 查找最后一个"/"
    if (last_slash != std::string::npos && last_slash < url.size() - 1) {
        std::string filename = url.substr(last_slash + 1);  // 取最后一个"/"后的内容
        if (!filename.empty()) {
            return filename;  // 返回URL提取的文件名
        }
    }

    // 优先级3：默认文件名（URL无路径或无文件名时，如"http://a.com/"→"index.html"）
    return "index.html";
}

/**
 * @brief 处理HTTP分块传输编码（Chunked Transfer Encoding）的响应体
 * @param response 完整的HTTP响应（包含响应头+响应体）
 * @param outfile 输出文件流（用于写入下载的内容）
 * @return 处理成功返回true，失败返回false
 * @note 分块传输格式：[十六进制块大小]\r\n[块数据]\r\n...0\r\n\r\n
 */
bool handle_chunked_transfer(const std::string& response, std::ofstream& outfile) {
    // 1. 找到响应体的起始位置：跳过响应头（响应头与响应体用"\r\n\r\n"分隔）
    size_t body_start = response.find("\r\n\r\n") + 4;  // +4是跳过"\r\n\r\n"的4个字符
    std::string chunk_data = response.substr(body_start);  // 提取所有分块数据

    size_t pos = 0;  // 当前处理到分块数据的位置
    while (pos < chunk_data.size()) {
        // 2. 查找当前块的大小结束位置（块大小后接"\r\n"）
        size_t chunk_size_end = chunk_data.find("\r\n", pos);
        if (chunk_size_end == std::string::npos) {  // 未找到"\r\n"，格式错误
            std::cerr << "无效的分块格式" << std::endl;
            return false;
        }

        // 3. 解析块大小（十六进制字符串→十进制整数）
        std::string chunk_size_str = chunk_data.substr(pos, chunk_size_end - pos);
        unsigned int chunk_size;  // 存储块的字节数
        try {
            // std::stoul：字符串转无符号长整型，base=16表示十六进制
            chunk_size = std::stoul(chunk_size_str, nullptr, 16);
        } catch (...) {  // 捕获所有异常（如字符串不是合法十六进制）
            std::cerr << "解析块大小失败: " << chunk_size_str << std::endl;
            return false;
        }

        // 4. 块大小为0表示分块传输结束（标准规定）
        if (chunk_size == 0) {
            break;
        }

        // 5. 移动到块数据的起始位置（跳过块大小后的"\r\n"，2个字符）
        pos = chunk_size_end + 2;

        // 6. 写入当前块数据到文件（避免越界，确保pos+chunk_size不超过数据长度）
        if (pos + chunk_size > chunk_data.size()) {
            std::cerr << "分块数据不完整" << std::endl;
            return false;
        }
        outfile.write(chunk_data.data() + pos, chunk_size);  // 二进制写入块数据

        // 7. 移动到下一个块的起始位置（跳过当前块数据后的"\r\n"，2个字符）
        pos += chunk_size + 2;
    }

    return true;  // 所有分块处理完成
}

/**
 * @brief 处理HTTP普通传输（非分块）的响应体
 * @param response 完整的HTTP响应（包含响应头+响应体）
 * @param outfile 输出文件流（用于写入下载的内容）
 * @return 处理成功返回true，失败返回false
 * @note 普通传输的响应体是连续字节流，直接提取即可
 */
bool handle_normal_transfer(const std::string& response, std::ofstream& outfile) {
    // 1. 找到响应体起始位置：跳过响应头（"\r\n\r\n"分隔）
    size_t body_start = response.find("\r\n\r\n") + 4;
    // 2. 提取响应体并写入文件（二进制模式，保留原始内容）
    outfile << response.substr(body_start);
    return true;
}

/**
 * @brief 核心函数：执行HTTP下载流程（解析URL→建立连接→发送请求→接收响应→保存文件）
 * @param url 输入的HTTP URL（如"http://im.20jd.com/home/index"）
 * @return 下载成功返回true，失败返回false
 */
bool download_file(const std::string& url) {
    std::string host, path;  // 存储解析后的主机名和请求路径
    int port;                // 存储解析后的端口号

    // 步骤1：解析URL，提取主机名、端口、路径
    if (!parse_url(url, host, port, path)) {
        return false;  // URL解析失败，直接返回
    }

    // 打印解析结果，方便用户确认
    std::cout << "下载: " << url << std::endl;
    std::cout << "主机: " << host << ", 端口: " << port << ", 路径: " << path << std::endl;

    // 步骤2：创建TCP socket（网络通信的基础句柄）
    // AF_INET：使用IPv4协议；SOCK_STREAM：使用TCP协议；0：默认协议（IPPROTO_TCP）
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {  // socket创建失败（返回-1）
        std::cerr << "创建socket失败: " << strerror(errno) << std::endl;  // strerror(errno)：获取具体错误信息
        return false;
    }

    // 步骤3：解析主机名到IP地址（如"im.20jd.com"→"1.2.3.4"）
    struct hostent* server = gethostbyname(host.c_str());  // host.c_str()：string转const char*
    if (server == nullptr) {  // 主机名解析失败（如域名不存在）
        std::cerr << "无法解析主机名: " << host << std::endl;
        close(sockfd);  // 关闭已创建的socket，避免资源泄漏
        return false;
    }

    // 步骤4：设置服务器地址结构（用于后续连接）
    struct sockaddr_in serv_addr;  // IPv4地址结构
    memset(&serv_addr, 0, sizeof(serv_addr));  // 初始化内存为0，避免垃圾值
    serv_addr.sin_family = AF_INET;            // 协议族：IPv4
    // 将主机名解析出的IP地址（server->h_addr）复制到地址结构
    memcpy(&serv_addr.sin_addr.s_addr, server->h_addr, server->h_length);
    // 将端口号转换为网络字节序（htons：host to network short，解决大小端问题）
    serv_addr.sin_port = htons(port);

    // 步骤5：连接到服务器（TCP三次握手）
    if (connect(sockfd, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) < 0) {
        std::cerr << "连接服务器失败: " << strerror(errno) << std::endl;
        close(sockfd);  // 连接失败，关闭socket
        return false;
    }

    // 步骤6：构造HTTP GET请求（严格遵循HTTP 1.1协议格式）
    std::string request;
    // 请求行：方法（GET）+ 路径 + 协议版本（HTTP/1.1）
    request = "GET " + path + " HTTP/1.1\r\n";
    // 请求头：Host（HTTP 1.1必须字段，指定主机名和端口）
    request += "Host: " + host + "\r\n";
    // 请求头：Connection: close（告诉服务器响应后关闭TCP连接，避免长连接占用资源）
    request += "Connection: close\r\n";
    // 请求头：User-Agent（标识客户端类型，部分服务器会校验该字段）
    request += "User-Agent: webget/1.0\r\n";
    request += "\r\n";  // 空行：表示请求头结束（HTTP协议要求）

    // 步骤7：发送HTTP请求到服务器
    // send：将请求数据写入socket发送缓冲区，返回发送的字节数
    if (send(sockfd, request.c_str(), request.size(), 0) < 0) {
        std::cerr << "发送请求失败: " << strerror(errno) << std::endl;
        close(sockfd);  // 发送失败，关闭socket
        return false;
    }

    // 步骤8：接收服务器的HTTP响应（循环接收，直到数据接收完）
    std::string response;        // 存储完整的响应数据
    char buffer[4096];           // 接收缓冲区（4KB大小，平衡效率和内存）
    ssize_t bytes_received;      // 每次接收的字节数（ssize_t支持负数值表示错误）

    // recv：从socket接收数据到缓冲区，返回接收的字节数（0表示连接关闭，-1表示错误）
    while ((bytes_received = recv(sockfd, buffer, sizeof(buffer) - 1, 0)) > 0) {
        buffer[bytes_received] = '\0';  // 给缓冲区加字符串结束符，避免拼接时乱码
        response += buffer;             // 将本次接收的数据拼接到完整响应中
    }

    // 检查接收过程是否出错
    if (bytes_received < 0) {
        std::cerr << "接收响应失败: " << strerror(errno) << std::endl;
        close(sockfd);  // 接收失败，关闭socket
        return false;
    }

    // 步骤9：关闭socket（数据已接收完，释放网络资源）
    close(sockfd);

    // 步骤10：解析HTTP响应状态码（判断请求是否成功）
    // 响应首行格式："HTTP/1.1 200 OK" 或 "HTTP/1.0 404 Not Found"
    if (response.substr(0, 9) != "HTTP/1.1 " && response.substr(0, 9) != "HTTP/1.0 ") {
        std::cerr << "无效的HTTP响应" << std::endl;
        return false;
    }
    // 提取状态码（首行第10-12个字符，3位数字）
    std::string status = response.substr(9, 3);
    if (status != "200") {  // 仅处理200 OK（请求成功），其他状态码（404/500等）报错
        std::cerr << "HTTP请求失败，状态码: " << status << std::endl;
        return false;
    }

    // 步骤11：确定本地保存的文件名
    std::string filename = get_filename(url, response);
    std::cout << "保存到文件: " << filename << std::endl;

    // 步骤12：打开文件（二进制模式ios::binary，避免文本模式转换换行符导致文件损坏）
    std::ofstream outfile(filename, std::ios::binary);
    if (!outfile.is_open()) {  // 检查文件是否成功打开（如权限不足）
        std::cerr << "无法打开文件: " << filename << std::endl;
        return false;
    }

    // 步骤13：判断响应体的传输方式（分块传输/普通传输）
    bool chunked = false;  // 是否为分块传输
    // 查找响应头中的"Transfer-Encoding: chunked"字段
    size_t transfer_encoding_pos = response.find("Transfer-Encoding: chunked");
    // 确保该字段在响应头中（而非响应体）：字段结束位置 < 响应头结束位置（"\r\n\r\n"）
    if (transfer_encoding_pos != std::string::npos &&
        response.find("\r\n", transfer_encoding_pos) < response.find("\r\n\r\n")) {
        chunked = true;
    }

    // 步骤14：根据传输方式处理响应体并写入文件
    bool success = false;
    if (chunked) {
        std::cout << "处理分块传输..." << std::endl;
        success = handle_chunked_transfer(response, outfile);
    } else {
        success = handle_normal_transfer(response, outfile);
    }

    // 步骤15：关闭文件流（无论成功与否，确保数据刷新到磁盘）
    outfile.close();

    // 步骤16：处理结果（成功提示/失败清理）
    if (success) {
        std::cout << "下载完成!" << std::endl;
        return true;
    } else {
        std::cerr << "处理响应失败" << std::endl;
        remove(filename.c_str());  // 删除不完整的文件，避免残留垃圾数据
        return false;
    }
}

/**
 * @brief 程序入口函数：解析命令行参数，触发下载流程
 * @param argc 命令行参数个数（如./webget url → argc=2）
 * @param argv 命令行参数数组（argv[0]是程序名，argv[1]是URL）
 * @return 程序退出码（0=成功，1=失败）
 */
int main(int argc, char* argv[]) {
    // 1. 检查命令行参数个数：必须传入1个URL（argc=2）
    if (argc != 2) {
        // 打印用法提示，指导用户正确使用
        std::cerr << "用法: " << argv[0] << " <URL>" << std::endl;
        std::cerr << "示例: " << argv[0] << " http://im.20jd.com/home/index" << std::endl;
        return 1;  // 参数错误，退出码1
    }

    // 2. 提取URL参数（argv[1]是用户输入的URL）
    std::string url = argv[1];
    // 3. 执行下载，根据返回值判断是否成功
    if (!download_file(url)) {
        return 1;  // 下载失败，退出码1
    }

    return 0;  // 程序正常结束，退出码0
}