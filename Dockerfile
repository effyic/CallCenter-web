# 使用官方的nginx镜像作为基础镜像
FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 删除nginx默认的静态文件
RUN rm -rf /usr/share/nginx/html/*

# 复制项目文件到nginx的html目录
COPY . /usr/share/nginx/html/

COPY default.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 设置标签
LABEL maintainer="Phone Bar SDK" \
      description="电话工具条SDK Web服务" \
      version="1.0"