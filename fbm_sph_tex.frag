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
//256*256 texture noise
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

vec4 fbm_sph(float freq, vec2 pos){
	vec4 t,s, c = vec4(1.,0.,0.,0.);
	float f, m;
	m = (1.-dot(uv,uv));
	m = m*step(.0, m);

  for (float i = freq + 1.; i > 0. ; --i){
		t = (-.165 + texture(noise, MR(i/(freq*pi*pi))*uv/(.5*f*i) - pos/2., i ));
		t += (-.165 + texture(noise, MR(i/(-freq*pi*pi))*uv/(.5*f*freq-i) - pos/2., freq-i));

		f = mod(i, 3.);

		if(f >= 0.) c = vec4(1.,0.,0.,1.);
		if(f >= 1.) c = vec4(0.,1.,0.,1.);
		if(f >= 2.) c = vec4(0.,0.,1.,1.);

		s += mix(t, c, c);
	}

	s = m * s / (2.*freq);

	return s;
}

void main(void) {
	r = resolution;
	scl = r.x>r.y?vec2(r.x/r.y, 1.):vec2(1., r.y/r.x);
	uv = (2. * (-.5 + (gl_FragCoord.xy / resolution.xy))) * scl;

	orig = vec2(.0, .0);
	ms = (2. * (-.5 + (touch / r))) * scl;

	c = fbm_sph(8., 128.*vec2(-sin(time/1000.), -cos(time/1000.)));

	gl_FragColor = 5. * c;
}
