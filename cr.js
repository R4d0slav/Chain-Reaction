const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const div = document.querySelector('div');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

class Ball {
    constructor() {
        this.radius = RADIUS;
        this.color = this.getRandomColor();
        let coords = this.getRandomCoords();
        this.x = coords[0];
        this.y = coords[1];
        this.dx;
        this.dy;
        this.setRandomSpeed();
        this.exploded = false;
        this.time = 0;
        ctx.lineWidth = 2;

    }

    rnd(from, to) { return Math.floor(Math.random()*(to-from+1)+from); }

    setCoords(x, y) { 
        this.x = x; 
        this.y = y; 
    }

    setSpeed(s) { 
        this.dx = s; 
        this.dy = s; 
    }

    explode() {
        this.exploded = true;
        this.radius*=2.5;
        this.time = new Date().getTime();
    }

    getRandomCoords(x = canvas.width, y = canvas.height) { return [Math.floor(Math.random()*(x-this.radius*2)+this.radius), Math.floor(Math.random()*(y-this.radius*2)+this.radius)] }

    setRandomSpeed() {
        let dir = [-1, 1];
        let m = this.rnd(-SPEED, SPEED);
        let n = Math.sqrt((SPEED*SPEED)-(m*m));
        let d = dir[Math.floor(Math.random()*dir.length)];
        this.dx = m * d;
        this.dy = n * d;
    }

    getRandomColor() {
        let colors = ["red", "green", "blue", "yellow", "purple", "orange", "lime", "pink", "cyan"];
        return colors[Math.floor(Math.random()*colors.length)];
    }

    refresh() { 
        this.move(); 
        this.draw(); 
    }
        
    move() {
        if (!this.exploded) {
            if (this.radius > this.x || this.x > canvas.width-this.radius) { this.dx *= -1; }
            if (this.radius > this.y || this.y > canvas.height-this.radius) { this.dy *= -1; }
            this.x+=this.dx;
            this.y+=this.dy;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.globalAlpha=1;
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.stroke();
        if (this.exploded) {
            ctx.globalAlpha=0.5;
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        ctx.closePath();
    
    }
}

class ChainReaction {
    constructor(n) {
        this.balls = [];
        this.exploded = -1;
        this.mouseball;
        this.collected = 0;
        this.time;
        this.init(n);
        this.move();
        this.mouse();
    }

    init(n) {        
        for (let i=0; i<n; i++) { this.balls.push(new Ball()); }
        this.mouseball = new Ball();
        this.mouseball.radius = RADIUS*2.5;
        this.mouseball.color = "white";
        this.mouseball.setSpeed(0);
        this.balls.push(this.mouseball);

        document.getElementById("level").innerHTML = "Level: "+LEVEL;
        document.getElementById("points1").innerHTML = "Collected: "+this.collected+"/"+Math.floor(BALLS);
        document.getElementById("points2").innerHTML = "Need at least: "+Math.floor(BALLS*COLLECT);

    }


    move() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.collision();
        this.time = new Date().getTime();
        for (let i=0; i<this.balls.length; i++) {
            if (this.balls[i].time > 0 && this.time-this.balls[i].time>TIME) {
                this.balls.splice(i, 1);
                this.exploded--;
            }
            else { this.balls[i].refresh(); }
        }
        if (this.exploded!=0) { window.requestAnimationFrame(() => this.move()); }
        else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.end();
        }
    }

    collision() {
        for (let i=0; i<this.balls.length; i++) {
            if (this.balls[i] != undefined && this.balls[i].exploded){
                for (let j=0; j<this.balls.length; j++) {
                    if (i!=j && this.balls[i] != undefined && !this.balls[j].exploded && this.intersect(this.balls[i], this.balls[j])) {
                        this.balls[j].explode();
                        this.exploded++;
                        this.collected++;
                        document.getElementById("points1").innerHTML = "Collected: "+this.collected+"/"+Math.floor(BALLS);
                    }
                }
            }
        }
    }

    intersect(b1, b2) {
        let a = (b1.radius-b2.radius)*(b1.radius-b2.radius);
        let b = ((b1.x-b2.x)*(b1.x-b2.x)) + ((b1.y-b2.y)*(b1.y-b2.y));
        let c = (b1.radius+b2.radius)*(b1.radius+b2.radius);
        return a <= b && b <= c;        
    }

    mouse() {
        let that = this;
        canvas.addEventListener('click', function(e) {
            if (!that.mouseball.exploded) {
                that.mouseball.explode();
                that.mouseball.radius = that.mouseball.radius/2;
                that.exploded = 1;
            }
        });

        canvas.addEventListener('mousemove', function(e) {
            if (!that.mouseball.exploded) { that.mouseball.setCoords(e.offsetX, e.offsetY); }
        });
    }

    end() {
        if (this.collected>=Math.floor(BALLS*COLLECT)) {
            BALLS-=Math.floor(Math.random()*10+5);
            LEVEL++;
            if (BALLS<=0) {
                BALLS = 40;
                COLLECT+=0.1;
            }
            if (COLLECT>1.0) { ctx.fillText("YOU WIN!, Well done", canvas.width/2.3, canvas.height/2); } 
            else { new ChainReaction(BALLS); }
        } else {
            LEVEL = 1;
            BALLS = 40;
            ctx.fillStyle = "white";
            ctx.font = "120% Times Roman";
            ctx.fillText("You lost!, try again", canvas.width/2.3, canvas.height/2);
        }
    }
}

const RADIUS = canvas.width*0.01;
const TIME = 3000; // ms
const SPEED = 4;
let BALLS = 40;
let COLLECT = 0.4;
let LEVEL = 1;

let startCR = function() {
    BALLS = 40;
    COLLECT = 0.4;
    LEVEL = 1;
    new ChainReaction(BALLS);
}


const start = document.getElementById("start").setAttribute("onClick", "javascript: startCR();");
