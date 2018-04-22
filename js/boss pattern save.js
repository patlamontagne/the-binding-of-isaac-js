// WEIRD PATTERN #1

// Object BOSS
if(this.canSpawn){
				this.canSpawn = false;
				for(var o = 0; o < 13; o++){
					this.aura.push(new this.Orb(40,40,0,120,480-(o*34) ));}
				for(var o = 0; o < 13; o++){
					this.aura.push(new this.Orb(40,40,120,240,480-(o*34) ));}
				for(var o = 0; o < 13; o++){
					this.aura.push(new this.Orb(40,40,240,0,480-(o*34) ));}
}

// Object ORB
if(this.angle < 360) this.angle+=  2/3;
	else this.angle =0;
	
if(this.variation == 1) this.pattern = 1;
else if (this.variation == 240) this.pattern = 0;

if(this.pattern == 1){
	this.variation += 1/2;	}
else if(this.pattern == 0){
	this.variation -= 1/2;	}
	

	this.x = ((Game.Bosses[0].x + Game.Bosses[0].width/2)  + (Math.sin(toRad(this.angle))*this.radius) -this.width/2)
	+ (Math.sin(toRad(this.variation))*this.radius);
	this.y = ((Game.Bosses[0].y + Game.Bosses[0].height/2) + (Math.cos(toRad(this.angle))*this.radius) -this.height/2) 
	+ (Math.cos(toRad(this.variation))*this.radius/4);
	
// FIN WEIRD PATTERN #1 (Animation de mort trop badass)
if(this.variation < 1) this.pattern = 1;
			else if (this.variation > 23) this.pattern = 0;
			
			if(this.pattern == 1){
				this.variation += this.variation/50;	}
			else if(this.pattern == 0){
				this.variation -= this.variation/-50;	}