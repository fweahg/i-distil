#version 320 es
precision highp float;

#define pi 3.1415926535897932384626433832795

out vec4 gl_FragColor;

uniform vec2 resolution;
uniform vec2 touch;
uniform vec3 pointers[10];

uniform float time;
uniform float startRandom;

uniform sampler2D backbuffer;///min:nn;mag:n;s:c;t:c;

vec4 tex, c;
vec2 rs, scl, uv, orig, ms, pnt;
float px,s;

float pen(vec2 pos, float width){
	return smoothstep(width, width - 3.*px , distance(pos, uv));
}

vec4 drw(float shape, vec3 color){
	return shape * vec4(color.r, color.g, color.b, shape);
}

vec3 mod289(const in vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec4 mod289(const in vec4 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec4 permute(const in vec4 v) { return mod289(((v * 34.0) + 1.0) * v); }
vec4 taylorInvSqrt(in vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 quintic(const in vec3 v)  { return v*v*v*(v*(v*6.0-15.0)+10.0); }

float pnoise(in vec3 P, in vec3 rep) {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = quintic(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

float f(float x){
	return ((-((((2.*((-x)/(2.)))/(pi))-floor(((2.*((-x)/(2.)))/(pi)))) *
		 (1.+2.*(((2.*((-x)/(2.)))/(pi))-floor(((2.*((-x)/(2.)))/(pi))))-
		 4. * (((((-x)/(2.)))/(pi))-floor(((((-x)/(2.)))/(pi)))))-
		 (((2.*(-x))/(pi))-floor(((2.*(-x))/(pi)))) *
		 (1.+2.*(((2.*(-x))/(pi))-floor(((2.*(-x))/(pi))))-
		 4. * (((-x)/(pi))-floor(((-x)/(pi))))))+
		 (((((2.*x)/(2.)))/(pi))-floor(((((2.*x)/(2.)))/(pi)))) *
		 (1.+2.*(((((2.*x)/(2.)))/(pi))-floor(((((2.*x)/(2.)))/(pi))))-
		 4. * (((((x)/(2.)))/(pi))-floor(((((x)/(2.)))/(pi)))))-
		 (((2.*x)/(pi))-floor(((2.*x)/(pi)))) *
		 (1.+2.*(((2.*x)/(pi))-floor(((2.*x)/(pi))))-
		 4. * (((x)/(pi))-floor(((x)/(pi))))))/(2.));
}

float g(float x){ return 2.*x/pi - floor(2.*x/pi);}
float l(float x) { return g(-x) * f(x/2. - pi/4.);}
float n(float x) { return g(x) * f(x/2. + pi/4.);}
float h(float x) { return n(x) + l(x + pi/2.);}

void main(void) {
	rs = resolution;
	scl = rs.x>rs.y?vec2(rs.x/rs.y, 1.):vec2(1., rs.y/rs.x);
	uv = (2. * (-.5 + (gl_FragCoord.xy / resolution.xy))) * scl ;

	orig = vec2(.0, .0);
	ms = (2. * (-.5 + (touch / rs))) * scl;
	pnt  = (2. * (-.5 + (pointers[0].xy / resolution.xy))) * scl;

	tex = texture(backbuffer, gl_FragCoord.xy/resolution);
	px = 4./min(rs.x ,rs.y);

	float noise,t;
	vec4 color, c1, c2;
	vec3 p;
	vec2 p1;
	
	p1 = vec2(-1./4., 1./3.);
	
	t = time/(8.*pi);
	p = 8.*pi*vec3(cos(t), sin(t), sin(t));

        //t = pi*time/(4.*pi);
        //p = 12. * vec3(-cos(t), -sin(t), h(t+pi));

	noise = pnoise(p + 48.*vec3(uv, pow( 0.85373472095314 , 2.)+
		pow(uv.x*uv.x + uv.y*uv.y, 1.79284291400159 )), (1.79284291400159)*vec3( 1., 1., -1.));
	float m =  1.-clamp( pow(distance(uv,vec2(.0,.0)), 2.) , .0, 1.);

	c1 = vec4(m*dot(vec2(noise+clamp(p1*uv,.0,1.)),vec2(m+clamp(p1*uv,.0,1.)) ));
	c2 = vec4(c1*dot(vec2(noise+clamp(p1*uv,.0,1.)),vec2(m+clamp(p1*uv,.0,1.)) ));
	color = c1 + c2 ;

	gl_FragColor = (1.-step(m,0.)) * vec4(3.*color) * vec4(.7,.45,.3,1.);
}
