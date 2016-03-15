var canvas = document.getElementById('particles'),
    ctx = canvas.getContext('2d'),
    canvasWidth = canvas.width = 500,
    canvasHeight = canvas.height = 500,
    // 焦距
    focallength = 250,
    particles,
    // 图片对象
    img;

// 显示fps的库
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

var mouseRadius = 50,
    mouseX = null,
    mouseY = null;

window.onmousemove = function(e) {
    if (e.target.tagName == "CANVAS") {
        // 计算鼠标在画布中的坐标
        mouseX = e.clientX - e.target.getBoundingClientRect().left;
        mouseY = e.clientY - e.target.getBoundingClientRect().top;
    } else {
        mouseX = null;
        mouseY = null;
    }
};


var particleArray = [],
    animateArray = [],
    particleSize_x = 2;
    particleSize_y = 4;

var RAF = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();



var canvasHandle = {
    init: function() {
        this._reset();
        this._initImageData();
        this._execAnimate();
    },

    _reset: function() {
        particleArray.length = 0;
        animateArray.length = 0;
        this.ite = 100;
        this.start = 0;
        this.end = this.start + this.ite;
    },

    _initImageData: function() {
        this.imgx = (canvasWidth - img.width) / 2;
        this.imgy = (canvasHeight - img.height) / 2;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, this.imgx, this.imgy, img.width, img.height);
        /**
         * ctx.getImageData返回的是一个对象，其中包含了width,height,data三个属性
         * width,height就是ctx.getImageData(0,0,canvasWidth,canvasHeight)中的canvasWidth,canvasHeight
         * data是图像的数据数组，里面保存了每一个像素的信息，data[0],data[1],data[2],data[3]分别表示的是第一个像素的R,G,B,A四个属性值，四个属性值为[0-255]，其中A-alpha通道，0表示透明，255是完全可见
         * 所以data的元素始终是像素个数*4，在循环的时候也是以4为步长计算
         *
         */
        var imageData = ctx.getImageData(this.imgx, this.imgy, img.width, img.height);
        for (var x = 0; x < img.width; x += particleSize_x) {
            for (var y = 0; y < img.height; y += particleSize_y) {
                var i = (y * imageData.width + x) * 4;

                // 过滤透明像素
                if(imageData.data[i+3] >= 128){
                    // 当前粒子的rgba值
                    var color = 'rgba(' + imageData.data[i] + ',' + imageData.data[i+1] + ',' + imageData.data[i+2] + ',' + imageData.data[i+3] + ')';

                        // 0 - 20之间的x浮动
                    var x_random = x + Math.random()*20,
                        // 200 - 400 的速度
                        vx = -Math.random()*200 + 400,
                        // 以图片中心y轴坐标为基准上下浮动20
                        y_random = img.height/2 - Math.random()*40 + 20,
                        vy;

                    if(y_random < this.imgy + img.height/2){
                        // y轴随机坐标小于图片中心y轴坐标
                        // 正向加速度
                        vy = Math.random()*300;
                    }else{
                        vy = -Math.random()*300;
                    }
                    var particle = new Particle(
                        x_random + this.imgx,
                        y_random + this.imgy,
                        x + this.imgx,
                        y + this.imgy,
                        vx,
                        vy,
                        color
                    );
                    particleArray.push(particle);
                }
            }
        }
    },
    _execAnimate: function() {
        var that = this;
        // 按照x轴速度大小排序，升序
        particleArray.sort(function(a,b){
            return a.ex - b.ex;
        });

        // 每次将一部分的粒子丢到动画数组里面
        if(!this.isInit){
            this.isInit = true;
            animate(function(tickTime){
                if(animateArray.length < particleArray.length){
                    if(that.end > (particleArray.length - 1)){
                        that.end = particleArray.length - 1;
                    }
                    animateArray = animateArray.concat(particleArray.slice(that.start,that.end));
                    that.start += that.ite;
                    that.end += that.ite;
                }

                animateArray.forEach(function(particle){
                    particle.update(tickTime);
                });
            });
        }
    }
};

var tickTime = 16;
function animate(tick){
    if(typeof tick == 'function'){
        var tickTime = 16;
        ctx.clearRect(0,0,canvasWidth,canvasHeight);
        tick(tickTime);
        stats.update();
        RAF(function(){
            animate(tick);
        })
    }
}


/**
 * 绘制图片
 * @param  {[type]} ctx  [description]
 * @param  {[type]} path 图片路径
 * @return {[type]}      [description]
 */
function loadImage(ctx, path, callback) {
    img = new Image();
    img.onload = function() {
        callback && callback();
    };
    img.src = path;
}

/**
 * 粒子对象
 * @param {[type]} x     x轴坐标
 * @param {[type]} y     y轴坐标
 * @param {[type]} ex    目标位置
 * @param {[type]} ey    目标位置
 * @param {[type]} vx    x轴粒子速度
 * @param {[type]} vy    y轴粒子速度
 * @param {[type]} color [description]
 */
var Particle = function(x, y, ex, ey, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.ex = ex;
    this.ey = ey;
    this.vx = vx;
    this.vy = vy;
    this.a = 1500;
    this.color = color;

    this.width = particleSize_x;
    this.height = particleSize_y;

    this.stop = false;
    this.static = false;
    this.maxCheckTimes = 10;
    this.checkLength = 5;
    this.checkTimes = 0;

};
var oldColor = '';
Particle.prototype = {
    drawSelf: function() {
        if(oldColor != this.color){
            ctx.fillStyle = this.color;
            oldColor = this.color;
        }
        ctx.fillRect(this.x - this.width/2,this.y - this.height/2,this.width,this.height);
    },
    move: function(tickTime){
        if(this.stop){
            this.x = this.ex;
            this.y = this.ey;
        }else{
            tickTime = tickTime / 1000;
            var cx = this.ex - this.x;
            var cy = this.ey - this.y;
            // 得到角度
            var angle = Math.atan(cy/cx);
            // 计算x轴运动长度
            var ax = Math.abs(this.a * Math.cos(angle));
            // 当前左边点x大于目标点ex,反向运动
            ax = this.x > this.ex ? -ax : ax;

            var ay = Math.abs(this.a * Math.sin(angle));
            ay = this.y > this.ey ? -ay : ay;

            this.vx += ax*tickTime;
            this.vy += ay*tickTime;
            this.vx *= 0.95;
            this.vy *= 0.95;
            this.x += this.vx*tickTime;
            this.y += this.vy * tickTime;

            // checkLength 为设置的监测是否静止的一个基准值
            if(Math.abs(this.x - this.ex) <= this.checkLength && Math.abs(this.y - this.ey) <= this.checkLength){
                this.checkTimes++;
                // 监测数据连续超过设置的最大次数值，我们认为当前粒子静止，不再执行的动画
                if(this.checkTimes > this.maxCheckTimes){
                    this.stop = true;
                }
            }else{
                this.checkTimes = 0;
            }
        }
    },
    update: function(tickTime){
        this.move(tickTime);
        this.drawSelf();
        this._checkMouse();
    },
    _checkMouse: function(){
        var that = this;
        if(!mouseX){
            goback();
            return;
        }

        var distance = Math.sqrt(Math.pow(mouseX - this.x,2) + Math.pow(mouseY - this.y,2));
        // 计算鼠标点和目标粒子点的角度
        var angle = Math.atan((mouseY - this.y)/(mouseX - this.x));
        // 如果鼠标和粒子之间的距离小于设置的半径
        if(distance < mouseRadius){
            this.stop = false;
            this.checkTimes = 0;
            if(!this.recordX){
                this.recordX = this.ex;
                this.recordY = this.ey;
            }

            this.a = 2000 + 1000 * (1 - distance/mouseRadius);
            // 计算粒子运动到以鼠标点为中心的圆的边缘距离
            var xc = Math.abs((mouseRadius - distance)*Math.cos(angle));
            var yc = Math.abs((mouseRadius - distance)*Math.sin(angle));

            xc = mouseX > this.x ? -xc : xc;
            yc = mouseY > this.y ? -yc : yc;
            this.ex = this.x + xc;
            this.ey = this.y + yc;
        }else{
            goback();
        }

        function goback(){
            if(that.recordX){
                that.stop = false;
                that.checkTimes = 0;

                that.a = 1500;
                that.ex = that.recordX;
                that.ey = that.recordY;

                that.recordX = null;
                that.recordY = null;
            }
        }
    }
};

function useImg(){
    loadImage(ctx, './demo.jpg', function() {
        canvasHandle.init();
    });
}

function useText(){
    particleSize_x = 1;
    particleSize_y = 1;
    console.log('text');
    var text = document.getElementById('inputText').value;
    img = document.createElement('canvas');
    img.width = 500;
    img.height = 300;
    var imgctx = img.getContext('2d');
    imgctx.textAlign = 'center';
    imgctx.textBaseline = 'middle';
    imgctx.font = '50px 微软雅黑';
    imgctx.fillText(text || '魅族科技',img.width/2,img.height/2);
    canvasHandle.init();
}
// useImg();
useText();