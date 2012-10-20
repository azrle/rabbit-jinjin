// 感谢Blobsallad一文，对模型的建立很有帮助
// Author : azrle 魏晅中
// Date : 2011-1-12
// E-mail : azrlew@gmail.com

// 谨以此兔送给瑾瑾
// I'll never stop falling in love with you!
// 2011 情人节快乐!

// ALL RIGHT RESERVED

function Vector(x, y) {
	this.x = x;
	this.y = y;
	
	this.getX = function() { return this.x; }
	this.getY = function() { return this.y; }
	this.setX = function(v) { this.x = v; }
	this.setY = function(v) { this.y = v; }
	this.addX = function(v) { this.x += v; }
	this.addY = function(v) { this.y += v; }
	this.add = function(v) {
		this.x += v.getX();
		this.y += v.getY();
	}
	this.set = function(v) {
		this.x = v.getX();
		this.y = v.getY();
	}
	this.sub = function(v) {
		this.x -= v.getX();
		this.y -= v.getY();
	}
	this.dotProd = function(v) { return this.x*v.getX()+this.y*v.getY(); }
	this.length = function() { return Math.sqrt(this.x*this.x+this.y*this.y); }
	this.scale = function(scaleFactor) {
		this.x *= scaleFactor;
		this.y *= scaleFactor;
	}
	this.show = function() { return '('+this.x+','+this.y+')'; }
}

function PointMass(cx, cy, mass, friction) {
	if (arguments.length < 4)  friction = 0.01;

	this.cur = new Vector(cx, cy);
	this.prev = new Vector(cx, cy);
	this.m = mass;
	this.force = new Vector(0, 0);
	//this.result = new Vector(0, 0);
	this.friction = friction;

	this.getXPos = function() { return this.cur.getX(); }
	this.getYPos = function() { return this.cur.getY(); }
	this.getXPrev = function(){ return this.prev.getX(); }
	this.getYPrev = function() { return this.prev.getY(); }
	this.getPos = function() {return this.cur; }
	this.addPos = function(v) { this.cur.add(v); }
	this.setPos = function(x, y) { 
		this.cur.x = x;
		this.cur.y = y;
	}
	this.setPrev = function(x, y) {
		this.prev.x = x;
		this.prev.y = y;
	}
	this.load = function(x, y, mass) {
		this.cur.x = x;
		this.cur.y = y;
		this.prev.x = x;
		this.prev.y = y;
		if (arguments.length > 2) this.m = mass;
	}
	this.setForce = function(v) { this.force.set(v); }
	this.setAcc = function(v) {
		var f = new Vector;
		f.set(v);
		f.scale(this.m);
		this.force.set(f);
	}
	this.addForce = function(v) { this.force.add(v); }
	this.getForce = function() { return this.force; }
	this.getMass = function() { return this.m; }
	this.setMass = function(v) { this.m = mass; }
	this.move = function(dt) {
		var a, o, n, dt_sq;
		
		dt_sq = dt*dt;
		
		a = this.force.getX()/this.m;
		o = this.cur.getX();
		n = (2.0-this.friction)*o-(1.0-this.friction)*this.prev.getX()+a*dt_sq;
		this.prev.setX(o);
		this.cur.setX(n);
		
		a= this.force.getY()/this.m;
		o = this.cur.getY();
		n = (2.0-this.friction)*o-(1.0-this.friction)*this.prev.getY()+a*dt_sq;
		this.prev.setY(o);
		this.cur.setY(n);
	}
	this.setFriction = function(friction) { this.frictioin = friction; }
	this.draw = function(ctx, scaleFactor,color) {
		if (arguments.length < 3) color = 'red';
		ctx.lineWidth = 2; 
		ctx.fillStyle = color; 
		ctx.strokeStyle = color; 
		ctx.beginPath(); 
		ctx.arc(this.cur.getX()*scaleFactor, this.cur.getY()*scaleFactor, 4.0, 0.0, Math.PI*2.0, true); 
		ctx.fill();
	}
}

function Joint(pA, pB, shortConst, longConst) {
	this.pA = pA.getPos();
	this.pB = pB.getPos();
	this.p = new Vector(0.0, 0.0);
	
	this.scon = shortConst;
	this.lcon = longConst;
	
	this.p.set(this.pB);
	this.p.sub(this.pA);
	
	this.shortLen = this.p.length() *shortConst;
	this.longLen = this.p.length() *longConst;
	
	this.slsq = this.shortLen * this.shortLen;
	this.llsq = this.longLen *  this.longLen;
	
	this.scale = function(scale) { 
		this.p.set(this.pB);
		this.p.sub(this.pA);
		this.shortLen = this.p.length() *this.scon;
		this.longLen = this.p.length() *this.lcon;
		this.slsq = this.shortLen * this.shortLen;
		this.llsq = this.longLen *  this.longLen;
	}
	
	this.adj = function() {
		this.p.set(this.pB);
		this.p.sub(this.pA);
		
		var len_sq = this.p.dotProd(this.p);
		
		if (len_sq < this.slsq) {
			scFactor = this.slsq / (len_sq+this.slsq)-0.5;
			this.p.scale(scFactor);
			
			this.pA.sub(this.p);
			this.pB.add(this.p);
		
		} else if (len_sq > this.llsq) {
			scFactor = this.llsq / (len_sq+this.llsq)-0.5;
			this.p.scale(scFactor);
			
			this.pA.sub(this.p);
			this.pB.add(this.p);
		}
	}
	
	this.draw = function(ctx) {
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#cccccc';
		ctx.beginPath();
		ctx.moveTo(this.pA.getX(), this.pA.getY());
		ctx.lineTo(this.pB.getX(), this.pB.getY());
		ctx.stroke();
	}
}

function Field(x, y, w, h) {
	this.w = w; this.h = h;
	this.left = x; this.right = x+w;
	this.top = y; this.bottom = y+h;
	
	this.set = function(x, y, w, h) {
		this.w = w; this.h = h;
		this.left = x; this.right = x+w;
		this.top = y; this.bottom = y+h;
	}
	this.collision = function(cur) {
		r = false;
		if (cur.getX()<=this.left) {
			cur.setX(this.left + scaleFactor / 100);
			r = true;
		}
		if (cur.getX()>=this.right) {
				cur.setX(this.right - scaleFactor / 100);
			r = true;
		}
		if (cur.getY()<=this.top) {
			cur.setY(this.top + scaleFactor / 100);
			r = true;
		}
		if (cur.getY()>=this.bottom) {
			cur.setY(this.bottom - scaleFactor / 100);
			r = true;
		}
		return r;
	}
	this.draw = function(ctx) {
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#cccccc";
		ctx.beginPath();
		ctx.moveTo(this.left, this.top);
		ctx.lineTo(this.right, this.top);
		ctx.lineTo(this.right, this.bottom);
		ctx.lineTo(this.left, this.bottom);
		ctx.lineTo(this.left, this.top);
		ctx.closePath();
		ctx.stroke();
	}
	this.clear = function(ctx, scaleFactor) {
		//ctx.clearRect(0, 0, this.w + scaleFactor, this.h + scaleFactor);
		ctx.clearRect(this.left - scaleFactor, this.top - scaleFactor, this.w + 2 * scaleFactor, this.h + 2 * scaleFactor);
	}
}

function Creature(points) {
	this.x = 0;
	this.y = 0;
	this.m = 0;
	this.zoom = 1;
	this.zoomFace = 1;
	this.union = 3;
	
	this.points = points;
	this.joints = new Array();

	this.setZoom = function(v, v2) { 
		var i, j, zoom = v;
		if (arguments.length > 1) this.zoomFace = v2;
		if (arguments.length > 0) {
			zoom /= this.zoom;
			this.zoom = v;
			j = zoom;
			if (zoom != 1) zoom = 1/(zoom-1);
			var cx, cy;
			for (i=0;i<this.num_p;++i) {
				cx = this.points[i].getPos().getX();
				cy = this.points[i].getPos().getY();
				if (j != 1)
					this.points[i].setPos(((1+zoom)*cx-this.mid.getPos().getX())/zoom,
						((1+zoom)*cy-this.mid.getPos().getY())/zoom);
				else this.points[i].setPos(cx, cy);
			}
			for (i=0;i<this.num_j;++i) this.joints[i].scale(this.zoom);
		}		
	}
	
	this.load = function(zoom, scon, lcon, union, offsetX, offsetY) {
		this.num_p = 0;
		this.num_j = 0;
		this.union = union;
		
		var p;
		for (p in points) {
			this.x += points[p].getPos().getX();
			this.y += points[p].getPos().getY();
			this.m += points[p].getMass();
			this.num_p++;
		}
		this.x /= this.num_p;
		this.y /= this.num_p;
		this.m /= this.num_p;

		this.mid = new PointMass(this.x + offsetX, this.y + offsetY, this.m);

		if (arguments.length > 0 && zoom != 1) {
			this.zoom = zoom;
			zoom = 1/(zoom-1);
			var cx, cy;
			for (p in points) {
				cx = points[p].getPos().getX();
				cy = points[p].getPos().getY();
				points[p].setPos(((1+zoom)*cx-this.mid.getPos().getX())/zoom,
						((1+zoom)*cy-this.mid.getPos().getY())/zoom);
			}
		}
		
		var i, j;
		for (i=0;i<this.num_p;++i) {
			this.joints[this.num_j++] = new Joint(this.points[i], this.mid, scon, lcon);
			for (j=1;j <= union;++j) {
				this.joints[this.num_j++] = new Joint(this.points[i], this.points[(i+j) % this.num_p], scon, lcon);
				this.joints[this.num_j++] = new Joint(this.points[i], this.points[(i + this.num_p -j) % this.num_p], scon, lcon);
			}
		}
	}
	
	this.move = function(dt) {
		var i;
		for (i=0;i<this.num_p;++i) {
			if (! env.collision(this.points[i].getPos())) this.points[i].move(dt);
			env.collision(this.points[i].getPos());
		}
		if (! env.collision(this.mid.getPos())) this.mid.move(dt);
	}
	
	this.adj = function() {
		var i, j;
		for (j=0;j<4;++j) {
			//Collision Judge?
			for (i=0; i<this.num_p; ++i) {
				env.collision(this.points[i].getPos());
			}
			for (i=0; i<this.num_j; ++i) {
				//env.collision(this.joints[i].st());
				//env.collision(this.joints[i].ed());
				this.joints[i].adj();
			}
		}
		//this.load();
	}
	
	this.setForce = function(force) {
		var i;
		for (i=0; i<this.num_p; ++i) this.points[i].setForce(force);
		this.mid.setForce(force);
	}
	this.setAcc = function(acc) {
		var i;
		for (i=0; i<this.num_p; ++i) this.points[i].setAcc(acc);
		this.mid.setAcc(acc);
	}

	this.selfTest = function() {
		if (this.mid.getPos().getY() < this.points[7].getPos().getY() ||
			this.mid.getPos().getY() < this.points[11].getPos().getY())
				return 1;	//upside down
		if (this.points[2].getPos().getX() > this.points[3].getPos().getY())
			return 2;	//leftside right
		return 0; //normal
	}
	
	this.findClosest = function(x, y) {
		var i, min , tx, ty, dis, j;
		tx = this.points[0].getPos().getX();
		ty = this.points[0].getPos().getY();
		min = (x-tx)*(x-tx)+(y-ty)*(y-ty);
		j = 0;
		for (i in this.points) {
			tx = this.points[i].getPos().getX();
			ty = this.points[i].getPos().getY();
			dis = (x-tx)*(x-tx)+(y-ty)*(y-ty);
			if (dis < min) {
				min = dis;
				j = i;
			}
		}
		if (this.points[j].getPos().getX() == x) x+=0.01;
		
		//DEBUG
		if (debug){
			var canvas = document.getElementById('jinjin');
			var ctx = canvas.getContext('2d');
			this.points[j].draw(ctx,1,'green');
		}
		//var angel = Math.atan((this.points[j].getPos().getY()-y)/(this.points[j].getPos().getX()-x)) ;
		// if (angel < 0) angel += Math.PI;
		// return {point : this.points[j], 
					// dis : Math.sqrt(min), 
					// ang : angel
				  // };
		//return offset
		return {x : this.points[j].getPos().getX()-this.mid.getPos().getX(), 
					y : this.points[j].getPos().getY()-this.mid.getPos().getY()
					};
	}
	this.moveTo = function(x, y) {
	    judge = new Vector(x, y);
		if (env.collision(judge)) return;
		var i, cur;
		cur = this.mid.getPos();
		x -= cur.getX();
		y -= cur.getY();
		x /= 10;  y /= 10; //IMPORTANT: MAKE IT SMOOTH
		
		for (i=0;i<this.num_p;++i){
			cur = this.points[i].getPos();
			cur.addX(x);
			cur.addY(y);
			env.collision(cur);
		}
		
		cur = this.mid.getPos();
		cur.addX(x);
		cur.addY(y);
		env.collision(cur);
	}
		
	this.drawRed = function(ctx, color) {
		var fixed = 1;
		if (this.points[1].getPos().getX()>this.points[4].getPos().getX()) fixed = -1;

		var fac = 0.5;
		
		x = this.points[3].getPos().getX() - this.points[2].getPos().getX();
		y = this.points[3].getPos().getY() - this.points[2].getPos().getY();
		var angel1 = Math.atan(-y/x);
		ctx.save();
		ctx.rotate(-angel1);
		ctx.scale(1, fac);
		ctx.fillStyle = color;
		ctx.strokeStyle = '#ffffff';
		ctx.beginPath();
		
		x = this.points[1].getPos().getX() + fixed*8;//*this.zoomFace;
		y = this.points[1].getPos().getY() + 10;//*this.zoomFace;
		var angel2 = Math.atan(y/x);
		var len = Math.sqrt(x*x+y*y);
		x = len*Math.cos(angel1+angel2);
		y = len*Math.sin(angel1+angel2)/fac;
		ctx.arc(x, y, 7*this.zoomFace, 0, Math.PI*2, false);
		ctx.fill();
		
		x = this.points[4].getPos().getX() - fixed*15;//*this.zoomFace;
		y = this.points[4].getPos().getY() + 8;//*this.zoomFace);
		angel2 = Math.atan(y/x);
		len = Math.sqrt(x*x+y*y);
		x = len*Math.cos(angel1+angel2);
		y = len*Math.sin(angel1+angel2)/fac;
		ctx.arc(x, y, 7*this.zoomFace, 0, Math.PI*2, false);
		
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}
	
	this.bigEye = function(ctx, x, y, angel) {
		ctx.save();
		ctx.translate(x, y);
		
		ctx.beginPath();
		ctx.fillStyle = '#000000';
		ctx.arc(0, 0, 8*this.zoomFace, 0, Math.PI*2, 0);
		ctx.fill();
		
		ctx.beginPath();
		ctx.fillStyle = '#ffffff';
		x = -4.24*Math.cos(angel+Math.PI/4)*this.zoomFace;
		y = -4.24*Math.sin(angel+Math.PI/4)*this.zoomFace;
		ctx.arc(x, y, 4*this.zoomFace, 0, Math.PI*2, 0);
		ctx.fill();
		
		x = 4.24*Math.cos(angel+Math.PI/4)*this.zoomFace;
		y = 4.24*Math.sin(angel+Math.PI/4)*this.zoomFace;
		ctx.arc(x, y, 2*this.zoomFace, 0, Math.PI*2, 0);
		ctx.fill();
		
		ctx.restore();
	}
	this.lineEye = function(ctx, x, y) {
		var tx = this.points[3].getPos().getX() - this.points[2].getPos().getX();
		var ty = this.points[3].getPos().getY() - this.points[2].getPos().getY();
		var angel1 = Math.atan(ty/tx);
		var angel2 = Math.PI/12;
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angel1+angel2);
		ctx.lineWidth = 3;
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.moveTo(-9,0);
		ctx.lineTo(9,0);
		ctx.stroke();
		ctx.restore();
	}
	this.drawEyes = function(ctx, angel, style) {
		var mx, my;
		var fixed = 1;
		if (this.points[1].getPos().getX()>this.points[4].getPos().getX()) fixed = -1;
		
		mx = (this.mid.getPos().getX() + this.points[1].getPos().getX())/2 + fixed*3;//*this.zoomFace;
		my = (this.mid.getPos().getY() + this.points[1].getPos().getY())/2 + 7;//*this.zoomFace;
		
		switch (style) {
			case 0 : this.bigEye(ctx,mx, my, angel); break;
			case 1 : this.lineEye(ctx,mx, my); break;
		}
				
		mx = (this.mid.getPos().getX() + this.points[4].getPos().getX())/2 - fixed*4;//*this.zoomFace;
		my = (this.mid.getPos().getY() + this.points[4].getPos().getY())/2 + 7;//*this.zoomFace;
		
		switch (style) {
			case 0 : this.bigEye(ctx,mx, my, angel); break;
			case 1 : this.lineEye(ctx,mx, my); break;
		}
	}
	
	this.drawMouth = function(ctx, happy) {
		var cx,cy,x,y;
		
		ctx.save();
	
		cx = this.points[3].getPos().getX() - this.points[2].getPos().getX();
		cy = this.points[3].getPos().getY() - this.points[2].getPos().getY();	
				
		x = 0; y = 0;
		var i;
		for (i=1;i<=4;++i) {
			x += this.points[i].getPos().getX();
			y += this.points[i].getPos().getY();
		}
		x /= 4;  y /= 4;
		//x = x;
		y = y - 7*this.zoomFace;
		
		ctx.translate(x,y);
		ctx.rotate(Math.atan(cy/cx));
		
		ctx.lineWidth = 3;
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		
		if (happy) ctx.arc(0 , 0, 6*this.zoomFace, Math.PI/6, Math.PI*5/6, false);
		 else ctx.arc(0 , 0, 6*this.zoomFace, -Math.PI/7, Math.PI*8/7, true);
		
		ctx.stroke();
		
		ctx.restore();
	}
	
	this.draw = function(ctx) {
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.moveTo(this.points[0].getPos().getX(), this.points[0].getPos().getY());
		//Body shape
		ctx.bezierCurveTo(this.points[2].getPos().getX(),this.points[2].getPos().getY(),
					this.points[3].getPos().getX(),this.points[3].getPos().getY(),
					this.points[5].getPos().getX(),this.points[5].getPos().getY());
		
		//Ears
		ctx.bezierCurveTo(this.points[6].getPos().getX(),this.points[6].getPos().getY(),
					this.points[7].getPos().getX(),this.points[7].getPos().getY(),
					this.points[8].getPos().getX(),this.points[8].getPos().getY());
		
		ctx.lineTo(this.points[9].getPos().getX(),this.points[9].getPos().getY());
		
		ctx.bezierCurveTo(this.points[10].getPos().getX(),this.points[10].getPos().getY(),
					this.points[11].getPos().getX(),this.points[11].getPos().getY(),
					this.points[0].getPos().getX(),this.points[0].getPos().getY());
		
		ctx.closePath();
		ctx.stroke();
		ctx.fillStyle = '#ffffff';
		ctx.fill();
		
		//Draw face
		this.drawMouth(ctx, happy);
		this.drawRed(ctx, '#e26a83');
		var ang, eyeClose;
		if (eyeBlink == 1) {
			if (Math.random()<0.02) eyeClose = 1; else eyeClose = 0;
		} else eyeClose = 0;
		if (eyeStable == 0) {
			ang = Math.PI/8*Math.random();
		} else ang = 0;
		this.drawEyes(ctx, ang, eyeClose);
	}
	this.draw2 = function(ctx) {
		var ofac = 2.7;
		var sfac = 5;
		ctx.lineWidth = 3;
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.moveTo(this.points[0].getPos().getX(), this.points[0].getPos().getY());
		var i,x, y, lx, ly, cx, cy;
		lx = this.points[0].getPos().getX();
		ly = this.points[0].getPos().getY()
		for (i=0;i<this.num_p;++i) {
			//ctx.lineTo(this.points[(i+1) % this.num_p].getPos().getX(), this.points[(i+1) % this.num_p].getPos().getY());
			x = this.points[(i+1) % this.num_p].getPos().getX();
			y = this.points[(i+1) % this.num_p].getPos().getY();
			cx = (x + lx)/2; 
			cy = (y + ly)/2;
			
			if (i == 1) {cy -= 6; }
			if (i == 2) fac = sfac; else fac = ofac;
			
			cx = ((1+fac)*cx-this.mid.getPos().getX())/fac;
			cy = ((1+fac)*cy-this.mid.getPos().getY())/fac;
			ctx.quadraticCurveTo(cx, cy, x, y);
			lx = x;
			ly = y;
		}
		ctx.closePath();
		ctx.stroke();
	}
}

function jump() {
	if (onJump) return;
	onJump = true;
	var i;
	for (i=6;i<=11;++i) rabbit.points[i].setForce(jumpForce);
	//rabbit.setForce(jumpForce);  will turn it upside down
	rabbit.move(dt);
	rabbit.adj();
	rabbit.setForce(zeroVec);
	setTimeout('onJump=false',1000);
}

var words = "Never stop falling in love with You!";
var curWord = '';
var curWordNum = 0;
var wordFixed = false;
function writing(ctx, x, y, font) {
	ctx.fillStyle = '#000000';
	ctx.font = "20px 'Gruppo'";
	ctx.fillText('21# Azrle', env.right-80, env.bottom - 5, 60);
	ctx.font = font;
	ctx.save();
	ctx.translate(x+10, y+40);
	ctx.rotate(-Math.PI/50);
	if (wordFixed) {
		ctx.fillText(words,0,0);
		ctx.restore();
		return;
	}
	if (curWordNum >= words.length) {
		curWordNum = 0;
		curWord = '';
	}
	curWord += words[curWordNum++];
	ctx.fillText(curWord,0,0);
	ctx.restore();
}

function drawIt() {
	var canvas = document.getElementById('jinjin');
	var ctx = canvas.getContext('2d');
		
	env.clear(ctx, scaleFactor * 100); 
	//ctx.clearr(0, 0,1000,10);
	
	if (inlove) {
		ps.render(ctx);
		if (curWordNum == words.length) {
			curWordNum++;
			wordFixed = true;
			setTimeout('wordFixed=false',5000);
		}
		writing(ctx,env.left+20,env.top+40,"36px 'Dancing Script'", wordFixed);
	}
	
	rabbit.draw(ctx);
	
	//DEBUG
	if (debug) {
		env.draw(ctx);
		for (i=0;i<rabbit.joints.length; ++i) rabbit.joints[i].draw(ctx);
		rabbit.mid.draw(ctx,1,'blue');
		var i; 
		for (i=0;i<points.length; ++i) rabbit.points[i].draw(ctx, 1);
	}
}

function update() {
	rabbit.setForce(gravity);
	
	if (selectOffset != null && savedMouseCoords != null) {
		rabbit.moveTo(savedMouseCoords.x - selectOffset.x, 
						savedMouseCoords.y - selectOffset.y);
	}
	rabbit.move(dt);
	
	rabbit.setForce(zeroVec);
	
	rabbit.adj();
	
	//Actions:
	if (selectOffset == null) {
		if (idle>1200) {
			happy=false;
			eyeStable = 0;
			if (idle > 2400) idle -= 1200;
		} else {
			happy = true;
			eyeStable = 1;
		}
		if (Math.random() < 0.003) jump();
		if (!happy && Math.random() < 0.006) jump();
		if (!onJump && Math.random() < 0.8 && rabbit.selfTest() == 1) jump();
		if (!happy && Math.random<0.5) happy = true;
	} else {
		if (click_times > 50) {
			happy = false;
			eyeBlink = 0;
			if (click_times > 100) click_times -= 50;
		}
	}
	if (inlove) { happy = true; click_times = 0; eyeBlink = 1; eyeStable = 0; }
	
	++idle;
}

function sampleDirection() {
	var theta = Math.random() * 2 * Math.PI;
	return new Vector2(Math.cos(theta), Math.sin(theta));
}

function refresh() {
	if (stop) return;
	
	if (inlove) {
		maskAll();
		ps.emit(new Particle(new Vector2((env.left+env.right) / 2, (3*env.top + env.bottom)/4), 
					sampleDirection().multiply((-env.left+env.right) / 4), 2.5, Color.red, 4));
		ps.simulate(dt);
	}

	drawIt();
		
	update();
	
	if (!stop) setTimeout('refresh()',freq);
}
function judgeInter() {
	var w = window.innerWidth, h = window.innerHeight;
	if (interaction) {
		maskAll();
	} else {
		unMask();
		w /= 4;
		h /= 3;
	}
	document.getElementById("jinjin").width = w;
	document.getElementById("jinjin").height = h;
	env.set(0,0,w,h);
	if (h/2.5/69<=window.innerHeight/318)
		rabbit.setZoom(h/2.5/69, h/2.5/70);
	else rabbit.setZoom(window.innerHeight/338, window.innerHeight/319);
}


var debug = false;
var gravity = new Vector(0, 90);
var jumpForce = new Vector(50, -30000);
var zeroVec = new Vector(0, 0);
var width = window.innerWidth;
var height = window.innerHeight;
var freq = 30;
var dt = 1/freq;
var env = new Field(0, 0, width, height);
var scaleFactor = 1;
var idle = 0;
var onJump = false;
var click_times = 0;
var inlove = false;

var savedMouseCoords = null;
var selectOffset = null;

var points = new Array();
var eyeBlink = 1;
var eyeStable = 0;
var happy = true;
var rabbit = new Creature(points);
var ps = new ParticleSystem();
var stop = true;
var interaction = false;

function pause() { interaction = false; unMask(); stop = true; }

function start() { stop = false; refresh(); }

var mylove = '80ad435299c2fcd3e89f476c04030e47';
var combination = [87, 88, 90];
var match_num = 0;
var person;

function loadPoints() {
	points[0] = new PointMass(96, 83, 1); 
	points[1] = new PointMass(74,103,1);
	points[2] = new PointMass(20, 143, 0.01);  //body control point
	points[3] = new PointMass(170, 153, 0.01); //body control point
	points[4] = new PointMass(135, 116, 1); 
	points[5] = new PointMass(124, 90, 1);
	points[6] = new PointMass(150,40,1); //Ear_r control
	points[7] = new PointMass(124,40,1); //Ear_r control
	points[8] = new PointMass(116,87,1);
	points[9] = new PointMass(106,85,1);
	points[10] = new PointMass(110,40,1); //Ear_l control
	points[11] = new PointMass(95,40,1);	  //Ear_l control
	
	// points[2].setFriction(0.75);
	// points[3].setFriction(0.75);
}
function init() {
	idle = 0;
	inlove = false;
	click_times = 0;
	
	loadPoints();
	//Load Rabbit
	happy = true;
	eyeBlink = 1; 
	eyeStable = 0;
	//size short long joint_para mid_offset(x y)
	rabbit.load(1, 0.99, 1.01, 4, 0, 0);  
	rabbit.setZoom(1.6, 1.5);
    
	function getMouseCoords(event) {
      if(event == null) event = window.event; 
      if(event == null) return null;
      if(event.pageX || event.pageY) {
        return {x:event.pageX / scaleFactor, y:event.pageY / scaleFactor};
      }
      return null;
    }
    
	document.onkeyup = function(event) {
			if (stop) return;
			if(event == null) event = window.event; 
			var keycode=event.keyCode;		
			if (keycode == null) return;
			
			if ((keycode == 120 || keycode == 119) && !inlove) {
				if (keycode == 119) {
					debug = ~debug;
				} else {
					interaction = !interaction;
					judgeInter();
				}
			} else if (inlove) interaction = true;
			
			if (inlove) return;
			
			if (keycode == combination[match_num]) {
				++match_num;
				if (match_num == combination.length) {
					person = prompt('你的名字?');
					if (person!=null && hex_md5(person)==mylove) {
						interaction = true;
						judgeInter();
						inlove = true;
					}
				}
			} else match_num = 0;
	}
	
	document.onmousedown = function(event) {
		if (interaction) {
			var mouseCoords; 
		  
			if (stop) return; 
			mouseCoords = getMouseCoords(event); 
			if(mouseCoords == null) return;
			savedMouseCoords = mouseCoords;
			selectOffset = rabbit.findClosest(mouseCoords.x, mouseCoords.y);
			
			idle = 0;
			click_times++;
			rabbit.moveTo(mouseCoords.x - selectOffset.x, mouseCoords.y - selectOffset.y);
		}
    }
	
    document.onmouseup = function(event) {
		savedMouseCoords = null; 
		selectOffset = null; 
    }
    document.onmousemove = function(event) {
		if (interaction) {
			var mouseCoords; 
		  
			if (stop)  return;
			if (selectOffset == null) return;
		 
			mouseCoords = getMouseCoords(event); 
			if(mouseCoords == null) return;
		   
			idle = 0;
			rabbit.moveTo(mouseCoords.x - selectOffset.x, mouseCoords.y - selectOffset.y);
			//rabbit.moveTo(mouseCoords.x, mouseCoords.y);
			savedMouseCoords = mouseCoords; 
		}
    }
	
	judgeInter();
	start();
}
