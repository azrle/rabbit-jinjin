//感谢Milo Yip的代码
//http://www.cnblogs.com/miloyip/archive/2010/06/14/Kinematics_ParticleSystem.html
//本人在代码略作修改
//Azrle 13FEB, 2011
Vector2 = function(x, y) { this.x = x; this.y = y; };

Vector2.prototype = {
    copy : function() { return new Vector2(this.x, this.y); },
    length : function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
    sqrLength : function() { return this.x * this.x + this.y * this.y; },
    normalize : function() { var inv = 1/this.length(); return new Vector2(this.x * inv, this.y * inv); },
    negate : function() { return new Vector2(-this.x, -this.y); },
    add : function(v) { return new Vector2(this.x + v.x, this.y + v.y); },
    subtract : function(v) { return new Vector2(this.x - v.x, this.y - v.y); },
    multiply : function(f) { return new Vector2(this.x * f, this.y * f); },
    divide : function(f) { var invf = 1/f; return new Vector2(this.x * invf, this.y * invf); },
    dot : function(v) { return this.x * v.x + this.y * v.y; }
};

Vector2.zero = new Vector2(0, 0);

Color = function(r, g, b) { this.r = r; this.g = g; this.b = b };

Color.prototype = {
    copy : function() { return new Color(this.r, this.g, this.b); },
    add : function(c) { return new Color(this.r + c.r, this.g + c.g, this.b + c.b); },
    multiply : function(s) { return new Color(this.r * s, this.g * s, this.b * s); },
    modulate : function(c) { return new Color(this.r * c.r, this.g * c.g, this.b * c.b); },
    saturate : function() { this.r = Math.min(this.r, 1); this.g = Math.min(this.g, 1); this.b = Math.min(this.b, 1); }
};

Color.black = new Color(0, 0, 0);
Color.white = new Color(1, 1, 1);
Color.red = new Color(1, 0, 0);
Color.green = new Color(0, 1, 0);
Color.blue = new Color(0, 0, 1);
Color.yellow = new Color(1, 1, 0);
Color.cyan = new Color(0, 1, 1);
Color.purple = new Color(1, 0, 1);

Particle = function(position, velocity, life, color, size) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = Vector2.zero;
    this.age = 0;
    this.life = life;
    this.color = color;
    this.size = size;
};

function drawHeart(ctx,x,y,size,color) {
	if (arguments.length < 5) color = 'red';
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(size, size);
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(75,40);
	ctx.bezierCurveTo(75,37,70,25,50,25);
	ctx.bezierCurveTo(20,25,20,62.5,20,62.5);
	ctx.bezierCurveTo(20,80,40,102,75,120);
	ctx.bezierCurveTo(110,102,130,80,130,62.5);
	ctx.bezierCurveTo(130,62.5,130,25,100,25);
	ctx.bezierCurveTo(85,25,75,37,75,40);
	ctx.fill();
	ctx.restore();
}	

function ParticleSystem() {
    // Private fields
    var that = this;
    var particles = new Array();

    // Public fields
    this.gravity = new Vector2(0, 90);
    this.effectors = new Array();

    // Public methods
        
    this.emit = function(particle) {
        particles.push(particle);
    };

    this.simulate = function(dt) {
        aging(dt);
        applyGravity();
        applyEffectors();
        kinematics(dt);
    };

    this.render = function(ctx) {
		var color;
        for (var i in particles) {
            var p = particles[i];
            var alpha = 1 - p.age / p.life;
			color = "rgba("
                + Math.floor(p.color.r * 255) + ","
                + Math.floor(p.color.g * 255) + ","
                + Math.floor(p.color.b * 255) + ","
                + alpha.toFixed(2) + ")";
			drawHeart(ctx, p.position.x, p.position.y, p.size/20, color);
        }
    }

    // Private methods
    
    function aging(dt) {
        for (var i = 0; i < particles.length; ) {
            var p = particles[i];
            p.age += dt;
            if (p.age >= p.life)
                kill(i);
            else
                i++;
        }
    }

    function kill(index) {
        if (particles.length > 1)
            particles[index] = particles[particles.length - 1];
        particles.pop();
    }

    function applyGravity() {
        for (var i in particles)
            particles[i].acceleration = that.gravity;
    }

    function applyEffectors() {
        for (var j in that.effectors) {
            var apply = that.effectors[j].apply;
            for (var i in particles)
                apply(particles[i]);    
        }
    }
    
    function kinematics(dt) {
        for (var i in particles) {
            var p = particles[i];
            p.position = p.position.add(p.velocity.multiply(dt));
            p.velocity = p.velocity.add(p.acceleration.multiply(dt));
        }
    }
}