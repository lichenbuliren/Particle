window.onload = function() {
    var canvas = document.getElementById('particles'),
        ctx = canvas.getContext('2d'),
        canvasWidth = canvas.width = 500,
        canvasHeight = canvas.height = 500,
        // 焦距
        focallength = 250;

    init(ctx);

    function init(ctx) {
        // 渲染图片
        renderImage(ctx, './demo.jpg');
    }

    /**
     * 绘制图片
     * @param  {[type]} ctx  [description]
     * @param  {[type]} path 图片路径
     * @return {[type]}      [description]
     */
    function renderImage(ctx, path, callback) {
        var img = new Image();
        img.onload = function() {
            var _this = this;
            ctx.drawImage(img, (canvasWidth - _this.width) / 2, (canvasHeight - _this.height) / 2);
            callback && callback();
        };
        img.src = path;
    }

    /**
     * 获取图像数据
     * @param  {[type]} ctx [description]
     * @param  {[type]} radius 圆球半径
     * @return {[type]}     [description]
     */
    function getImageData(ctx, radius) {
        var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // 粒子数组
        var particles = [];

        /**
         * ctx.getImageData返回的是一个对象，其中包含了width,height,data三个属性
         * width,height就是ctx.getImageData(0,0,canvasWidth,canvasHeight)中的canvasWidth,canvasHeight
         * data是图像的数据数组，里面保存了每一个像素的信息，data[0],data[1],data[2],data[3]分别表示的是第一个像素的R,G,B,A四个属性值，四个属性值为[0-255]，其中A-alpha通道，0表示透明，255是完全可见
         * 所以data的元素始终是像素个数*4，在循环的时候也是以4为步长计算
         *
         */
        for (var y = 0; y < imageData.height; y += radius*2) { //以Y轴为外层遍历
            for (var x = 0; x < imageData.width; x += radius*2) { //横向遍历画布像素点
                // i 为当前像素点的位置
                var i = 4 * (y * imageData.height + x);
                // 过滤部分看不见的像素点
                if (imageData.data[i + 3] >= 128) {
                    var particle = new Particle(ctx,x - radius, y - radius, 0, radius);
                    particles.push(particle);
                }
            }
        }

        return particles;
    }
}

var Particle = function(ctx,centerX, centerY, centerZ, radius) {
    // 保存原来的位置
    this.dx = centerX;
    this.dy = centerY;
    this.dz = centerZ;

    // 保存粒子聚合后又飞散开的位置
    this.tx = 0;
    this.ty = 0;
    this.tz = 0;

    this.x = centerX;
    this.y = centerY;
    this.z = centerZ;
    this.radius = radius;
};
Particle.prototype = {
    drawSelf: function() {
        ctx.save();
        ctx.beginPath();
        var scale = focallength/(focallength + this.z);
        ctx.arc(this.x,this.y,this.radius*scale);
        ctx.fillStyle = 'rgba(50,50,50,' + scale +')';
        ctx.fill();
        ctx.restore();
    }
}