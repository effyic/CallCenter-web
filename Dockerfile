# 使用金蝶ALB镜像
FROM harbor.apusic.com/apusic/alb:V2.0.5-se.20251231-kylin-amd64

# 设置工作目录
WORKDIR /opt/ALB-V2.0.5-SE

# 复制自定义的 alb.conf (包含 conf.d/*.conf)
COPY alb_custom.conf /opt/ALB-V2.0.5-SE/conf/alb.conf

# 创建 conf.d 目录
RUN mkdir -p /opt/ALB-V2.0.5-SE/conf/conf.d

# 复制项目文件到 html 目录
COPY . /opt/ALB-V2.0.5-SE/html/

# 复制配置文件
COPY default.conf /opt/ALB-V2.0.5-SE/conf/conf.d/default.conf

# 创建SSL目录并复制证书
RUN mkdir -p /etc/nginx/ssl
COPY ./cert/server.crt /etc/nginx/ssl/server.crt
COPY ./cert/server.key /etc/nginx/ssl/server.key
COPY ./cert/_.bphc.com.cn.cer /etc/nginx/ssl/_.bphc.com.cn.cer
COPY ./cert/_.bphc.com.cn.key /etc/nginx/ssl/_.bphc.com.cn.key

# 暴露端口
EXPOSE 80 443 5066 1081 8080

# 启动命令
CMD ["bash", "/opt/ALB-V2.0.5-SE/bin/start-alb-and-console.sh"]

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 设置标签
LABEL maintainer="Phone Bar SDK" \
      description="电话工具条SDK Web服务" \
      version="1.0"
