#version 320 es
// run with shader editor 
// https://github.com/markusfisch/ShaderEditor/blob/master/FAQ.md

precision highp float;

#define pi 3.1415926535897932384626433832795
#define e exp(1.0)
// log is ln ;so  lg*log(n) is log10(n)
#define lg 1./log(10.)
#define ln(n) log(n)
#define log10(n) log(n)/log(10.)

out vec4 gl_FragColor;

uniform vec2 resolution;
uniform vec2 touch;
uniform vec3 pointers[10];

uniform float time;
uniform float startRandom;

uniform sampler2D backbuffer;///min:nn;mag:n;s:c;t:c;

vec4 tex, c, pr;
vec3 col;
vec2 res, scl, uv, o, j, j1, j2, j3, ms, pnt;
float px, s, m, mj, p;

float pen(vec2 pos, float width){
	return smoothstep(width, width - 3.*px , distance(pos, uv));
}

vec4 drw(float shape, vec3 color){
	return shape * vec4(color.r, color.g, color.b, shape);
}

vec2 trx(vec2 v){ return vec2(-v.x, v.y);}
vec2 try(vec2 v){ return vec2(v.x, -v.y);}
mat2 M(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

float med(vec2 v){
	return (v.x+v.y)/2.;
}

float modv2f(vec2 v, float f){
	return med(f*mod(v, 1./f));
}

float modv2f2(vec2 v, float f){
	return modv2f(f*v*modv2f(v, f), 1./f);
}

float modv2fp(vec2 v, float f){
	return pow((modv2f2(v, f)), 2.);
}

float modv2fp(vec2 v, float f, float p){
	return pow((modv2f2(v, f)), p);
}

float diag(vec2 v, float f){
	return round(f + f*med(v))/(2.*f);
}

float dam(vec2 v, vec2 f){
	return med(vec2(diag(M(-pi/4.)*v, f.x), diag(trx(M(-pi/4.)*v), f.y)));
}

float noise(vec2 v){
	float s;
	s = -1. + 2.*fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
	return s;
}

void main(void) {
	res = resolution;
	scl = res.x>res.y?vec2(res.x/res.y, 1.):vec2(1., res.y/res.x);
	uv = (2. * (-.5 + (gl_FragCoord.xy / resolution.xy))) * scl;

	o = vec2(.0, .0);
	ms = (2. * (-.5 + (touch / res))) * scl ;
	pnt  = (2. * (-.5 + (pointers[0].xy / resolution.xy))) * scl;

	//tex = texture(backbuffer, gl_FragCoord.xy/resolution);

	vec2 q = gl_FragCoord.xy / res;
	vec2 p = 2.*(-1. + 2.*q)*scl;

	float background = 1.;//smoothstep(-.25, .25, p.x);
	float f1, f2, f3;

	//p = (vec2(.0, 1.0)+p) * vec2(1., .5) ;
/*
	float f1 = modv2f (vec2(-p.x, p.y), 3.);
	float f2 = modv2f2(vec2(p.x, -p.y), 9.);
	float f3 = modv2fp(p, 27.);

	vec3 col = f3*vec3(f1, f2, .75);
*/

	m = 1. - smoothstep(0.0, 6.0, dot(p, p));
	//j = o+vec2(.375,.25)+dot(p, p)*(dot(p*p-vec2(.0,.5), p));
	j1 = o+ p*(dot(p, p));
	j2 = o+ p*(dot(p, p) + (dot(p,p)/length(dot(p,p))));
	j3 = o+ p*(dot(p, p) - (dot(p,p)/length(dot(p,p))));
	j = pow( vec2(2.*ms.y)+1./( (1./(1./j1 - 1./j2 + 1./j3)) * ((1./(1./j1 - 1./j2 + 1./j3)) + (1./(1./(j1*j1) - 1./(j2*j2) + 1./(j3*j3))))), vec2(-1./pow(2., 7.))*vec2(-16./2.) );
	
	mj = pow(1.+1./512.-smoothstep(0., pow(med(j), 2.*sqrt(2.)), dot(j, j)/length(j) ), 1./8.);

	f1 = dam(j, vec2(9.)) ;
	f2 = dam(try(j), vec2(9.));
	f3 = dam(trx(j), vec2(9.));

	col = mj*vec3(f1, f2, f3);

	col = col;

	gl_FragColor = vec4(col*background, 1.);
}
