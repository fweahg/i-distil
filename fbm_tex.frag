#version 320 es
precision highp float;

#define pi 3.1415926535897932384626433832795
#define e exp(1.0)
// log is ln ;so  lg*log(n) is log10(n)
#define lg 1./log(10.)
#define ln(n) log(n)
#define log10(n) log(n)/log(10.)
#define lx(n,w) w*log(n)/log(w)

out vec4 gl_FragColor;

uniform vec2 resolution;
uniform vec2 touch;
uniform vec3 pointers[10];

uniform float time;
uniform float startRandom;

uniform sampler2D backbuffer;///min:nn;mag:n;s:c;t:c;
uniform sampler2D noise;///min:ll;mag:l;s:r;t:r

vec4 tex, c;
vec2 r, scl, uv, orig, ms, pnt;
float px,s;

float pen(vec2 pos, float width){
	return smoothstep(width, width - 3.*px , distance(pos, uv));
}

vec4 drw(float shape, vec3 color){
	return shape * vec4(color.r, color.g, color.b, shape);
}

mat2 MR(float a){ return mat2(cos(a), -sin(a), sin(a), cos(a));}

vec4 fbm(float f){
	vec4 t;
  for (float i = f+1.; i > 0. ; --i){
		t += -.5+2.*texture(noise, MR(i)*(1./2.+uv/(2.*i)), i);
		t += -.5+2.*texture(noise, MR(i)*(1./2.+uv/(2.*f-i)), f-i);
	}
	t /= f;
	return t;
}

void main(void) {
	r = resolution;
	scl = r.x>r.y?vec2(r.x/r.y, 1.):vec2(1., r.y/r.x);
	uv = (2. * (-.5 + (gl_FragCoord.xy / resolution.xy))) * scl;

	orig = vec2(.0, .0);
	ms = (2. * (-.5 + (touch / r))) * scl;

	c = fbm(10.*ms.y);

	gl_FragColor = c;
}
