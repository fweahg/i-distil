#version 320 es
precision highp float;

//j’enlève mes nouvelles lunettes le troisième jour, 
//j’ai l’impression que les verres sont moins épais, ça ressemble un peu

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

vec4 fbm_sky(vec2 pos){
	vec4 t,s,c;
	float i, f, q, m;

	q = 27.;

	m = (3.-dot(uv,uv));
	m = m*step(.0, m);
	c = vec4(1.,0.,0.,0.);

  for (i = q; i >= 1. ; i--){
  	f = mod(i, 3.); // reste i / 3 => {0,1,2}

		if(f >= 0.) c = vec4(0.5, 1.00, 0.5, 1.00);
		if(f >= 1.) c = vec4(1.00, 0.5, 0.5, 1.00);
		if(f >= 2.) c = vec4(0.5, 0.5, 1.00, 1.00);

		t = (   texture(noise, MR(i/((q+(f+1.)/q)*pi*pi))*inversesqrt(1./pow(   i -atan(uv),vec2(3.))) / (.5*(f+1.)*   i ) - pos/2.,    i /9. ));
		t = (t+(texture(noise, MR(i/((q-(f+1.)/q)*pi*pi))*inversesqrt(1./pow((q-i)-atan(uv),vec2(3.))) / (.5*(f+1.)*(q-i)) - pos/2., (q-i)/9. )))/2.;

		//s += mix(t, c, c);
		s += (t*c)/q;
	}

	s = m * (-.125 + pow(e*s, vec4(e)))/1.2 ;

	return s;
}

void main(void) {
	r = resolution;
	scl = r.x>r.y?vec2(r.x/r.y, 1.):vec2(1., r.y/r.x);
	uv = (1. * (-.5 + (gl_FragCoord.xy / resolution.xy))) * scl;

	orig = vec2(.0, .0);
	ms = (2. * (-.5 + (touch / r))) * scl;

	c = fbm_sky(vec2(time/500.,sin(time/500.)));
	//c = fbm_sky(ms);

	gl_FragColor = c;
}
