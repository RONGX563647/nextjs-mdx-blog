以下是更全面详细的 Git 与 Gitee 笔记，补充了底层原理、高级操作、场景化应用及问题排查，适合系统性学习：

### **一、Git 底层核心原理**

#### 1. 四大核心区域

- **工作区（Working Directory）**：本地可见的文件目录，即日常编辑的文件。
- **暂存区（Staging Area/Index）**：位于 `.git/index`，临时存储待提交的改动，是工作区与仓库的中间层。
- **本地仓库（Local Repository）**：位于 `.git` 目录，存储完整的版本历史（commit 对象、树对象等）。
- **远程仓库（Remote Repository）**：托管在服务器（如 Gitee）的仓库，用于多人共享代码。

#### 2. 数据结构

- **Blob 对象**：存储文件内容（二进制大对象），无文件名信息。
- **Tree 对象**：存储目录结构，包含 blob 或子 tree 的引用及文件名。
- **Commit 对象**：包含 tree 引用（当前版本快照）、父 commit 引用（历史关系）、作者、提交信息、时间戳。
- **分支（Branch）**：指向某个 commit 的可变指针（如 `main` 指向最新提交）。
- **HEAD**：特殊指针，指向当前所在分支的最新 commit。

### **二、Git 基础操作进阶**

#### 1. 文件跟踪精细化控制

bash

```bash
# 跟踪单个文件（排除其他）
git add README.md

# 跟踪特定类型文件
git add *.js

# 取消跟踪文件（保留本地文件，仅从版本控制中移除）
git rm --cached <文件名>  # 需提交此操作才生效

# 强制删除文件（本地文件也会删除）
git rm <文件名> && git commit -m "删除文件"
```

#### 2. 提交历史高级查看

bash

```bash
# 查看指定文件的修改历史
git log <文件名>

# 查看近3次提交
git log -3

# 显示每次提交的改动内容（简略）
git log -p -2  # 近2次提交的详细差异

# 按作者筛选提交
git log --author="Your Name"

# 按时间筛选（例：近一周）
git log --since="1 week ago"
```

#### 3. 版本回滚深度操作

- **场景 1：撤销已提交但未推送到远程的改动**

  bash

  

  

  

  

  

  ```bash
  # 查看提交ID
  git log --oneline
  # 回滚到目标版本（保留后续改动为未暂存状态）
  git reset <目标commit-id>
  ```

- **场景 2：撤销已推送到远程的提交（不修改历史，推荐）**

  bash

  

  

  

  

  

  ```bash
  git revert <需要撤销的commit-id>  # 生成新的撤销提交
  git push  # 推送撤销结果
  ```

  *原理：revert 会创建一个新 commit 抵消旧 commit 的改动，不破坏历史记录，适合公共分支。*

- **场景 3：彻底删除历史中的敏感信息（谨慎）**

  bash

  

  

  

  

  

  ```bash
  # 移除文件的所有历史记录
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch 敏感文件路径" \
    --prune-empty --tag-name-filter cat -- --all
  # 强制推送（会覆盖远程历史，仅在私有仓库或团队确认后使用）
  git push origin --force --all
  ```

### **三、分支管理深度实战**

#### 1. 分支策略模型

- **Git Flow**：适用于大型项目，包含 5 类分支：
  - `main`：生产环境代码，保持稳定。
  - `develop`：开发主分支，集成已完成功能。
  - `feature/*`：新功能开发（从 develop 分出，合并回 develop）。
  - `release/*`：版本发布准备（从 develop 分出，合并到 main 和 develop）。
  - `hotfix/*`：生产环境紧急修复（从 main 分出，合并到 main 和 develop）。
- **GitHub Flow**：轻量策略，仅用 `main` 分支和临时功能分支，适合持续部署场景：
  1. 从 `main` 分 `feature` 分支开发。
  2. 完成后提交 PR，通过审核后合并回 `main`。
  3. 合并后自动部署。

#### 2. `rebase` 与 `merge` 对比

- **`merge`**：保留分支合并历史，形成菱形结构，适合公共分支协作。

  bash

  

  

  

  

  

  ```bash
  git checkout main
  git merge feature  # 合并 feature 到 main，生成合并 commit
  ```

- **`rebase`**：将当前分支的提交 “嫁接” 到目标分支最新提交之后，历史更线性，适合个人分支整理。

  bash

  

  

  

  

  

  ```bash
  git checkout feature
  git rebase main  # 将 feature 基于 main 的最新状态重新提交
  # 若冲突，解决后执行：
  git add <冲突文件>
  git rebase --continue  # 继续 rebase 过程
  # 完成后合并到 main（此时为快进合并，无额外 commit）
  git checkout main
  git merge feature
  ```

  *注意：不要对已推送到远程的公共分支执行 rebase，会导致他人历史冲突。*

#### 3. 分支备份与恢复

bash











```bash
# 备份当前分支到新分支
git branch backup-branch

# 恢复已删除的分支（需知道分支最后一个 commit-id）
git checkout -b 恢复的分支名 <commit-id>
```

### **四、Gitee 平台功能全解析**

#### 1. 仓库基础配置

- **分支保护**：
  仓库 → 管理 → 分支管理 → 保护分支（如 `main`）：
  - 禁止直接推送，强制通过 PR 合并。
  - 要求代码审查通过（设置最少审核人数）。
  - 关联 CI 检查，通过后才能合并。
- **协作权限**：
  仓库 → 管理 → 协作者：
  - 权限等级：Owner（所有者）、Master（管理员）、Developer（开发者）、Reporter（观察者）。
  - 可按分支分配权限（如仅允许特定人推送 `main` 分支）。

#### 2. Issues 与任务管理

- **创建 Issues**：记录 Bug、需求或任务，支持标签（`bug`/`feature`）、里程碑、指派负责人。
- **关联提交**：提交时在说明中加入 `#issue编号`，自动关联 Issues（如 `git commit -m "修复登录bug #123"`）。
- **自动化**：关闭 Issues 时，可在 PR 描述中添加 `closes #123`，合并后自动关闭对应 Issues。

#### 3. Gitee Pages 静态网站部署

- 基于仓库代码生成静态网站（如文档、博客）：

  仓库 → 服务 → Gitee Pages：

  - 选择分支（如 `gh-pages`）和目录（`/` 或 `docs`）。
  - 部署后可通过 `https://用户名.gitee.io/仓库名` 访问。

#### 4. Gitee CI/CD 自动化流程

- 配置文件

   

  ```
  .gitee-ci.yml
  ```

   

  放在仓库根目录，示例（Python 项目测试）：

  yaml

  

  

  

  

  

  ```yaml
  stages:
    - test
  
  test_job:
    stage: test
    script:
      - pip install -r requirements.txt
      - pytest tests/
    tags:
      - python  # 选择运行环境
  ```

  提交后自动触发测试，结果在仓库 → CI/CD 中查看。

### **五、高级场景与技巧**

#### 1. 大型文件管理（Git LFS）

- 解决 Git 对大文件（如图片、视频）处理效率低的问题：

  bash

  

  

  

  

  

  ```bash
  # 安装 LFS
  git lfs install
  
  # 跟踪指定类型大文件
  git lfs track "*.psd"  # 跟踪所有 PSD 文件
  git add .gitattributes  # 提交跟踪规则
  
  # 正常提交大文件
  git add design.psd
  git commit -m "添加设计稿"
  git push
  ```

#### 2. 提交拆分与合并

- **拆分暂存区改动**：

  bash

  

  

  

  

  

  ```bash
  git add -p <文件名>  # 交互式选择文件中需要暂存的部分（按 y/n 选择）
  ```

- **合并多个提交（压缩历史）**：

  bash

  

  

  

  

  

  ```bash
  git rebase -i HEAD~3  # 操作最近3个提交
  # 在编辑器中，将需要合并的提交前的 pick 改为 squash，保存退出
  # 编辑合并后的提交信息，完成后推送（若已推送，需 --force）
  ```

#### 3. 跨仓库操作（cherry-pick）

- 将 A 分支的某个提交复制到 B 分支：

  bash

  

  

  

  

  

  ```bash
  git checkout B  # 切换到目标分支
  git cherry-pick <A分支的commit-id>  # 复制提交
  # 若冲突，解决后 git add 并 git cherry-pick --continue
  ```

### **六、常见错误与解决方案**

#### 1. 合并冲突无法解决

- 放弃合并：`git merge --abort`
- 用可视化工具解决：`git mergetool`（需提前配置工具，如 VS Code）

#### 2. 误推敏感信息到远程

- 立即修改敏感信息（如密码）。
- 用 `git filter-branch` 清除历史（见前文），并通知团队成员重新克隆仓库（避免旧历史残留）。

#### 3. 分支游离（detached HEAD）

- 原因：直接检出某个 commit（而非分支），导致 HEAD 指向 commit 而非分支。
- 解决：创建新分支保留当前状态：`git checkout -b 新分支名`

#### 4. 推送被拒绝（non-fast-forward）

- 原因：本地分支落后于远程，需先拉取更新：

  bash

  

  

  

  

  

  ```bash
  git pull --rebase origin 分支名  # 拉取并变基，减少合并 commit
  git push
  ```

### **七、效率提升工具与配置**

#### 1. Git 别名（Alias）配置

bash











```bash
# 设置常用命令别名（全局生效）
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"
git config --global alias.unstage "reset HEAD --"  # 撤销暂存：git unstage 文件名
git config --global alias.last "log -1 HEAD"  # 查看最后一次提交：git last
```







![img](data:image/png;base64,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)

#### 2. 可视化工具推荐

- **GUI 客户端**：GitKraken、SourceTree、VS Code 内置 Git 工具。
- **命令行增强**：`lazygit`（终端交互式工具，简化复杂操作）。

通过以上内容，可系统掌握从基础到进阶的 Git 操作，结合 Gitee 平台特性实现高效协作。实际应用中，建议结合具体项目场景灵活选择分支策略和工具，逐步形成自己的工作流。