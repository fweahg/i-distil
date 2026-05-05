#version 320 es
precision highp float;
precision highp sampler2D;
precision highp sampler3D;
precision highp samplerCubeArray;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D backbuffer;
/*
uniform sampler3D v3s;
uniform samplerCubeArray v4s;
*/

out vec4 FragColor[4];
/*
struct Data {
	vec4 col ;
	vec4 pos ;
	vec4 usr1;
	vec4 usr2;
};

buffer extBuf {
	int len ;
	Data data[];
} buf ;
*/

#define PI 3.1415926535

vec2 cartesian(){
	vec2 p = 2.0*( gl_FragCoord.xy / resolution.xy )-1.0;
	p.x *= resolution.x / resolution.y;
	return p;
}

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(-1.+abs( mod(c.r*6.0+vec3(0.0,4.0,2.0),6.0) - 3.0),
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return mix( vec3(1.0), rgb, c.g) * c.b;
}

vec4 postfxnvp(vec4 c) {

	vec4 r = c + 1./pow(exp(1.), 6.);

	if(r.r > 1.) r.r = 0. ;
	if(r.g > 1.) r.g = 0. ;
	if(r.b > 1.) r.b = 0. ;
	r.a = 1.0;

	//return r;
	//return r + FragColor[1] * .00390625;
	//return r + FragColor[1] * ((mouse-.5).x)/10. ;
    //return r + (FragColor[1]*(( .25*(2.+sin(.05*time*pow(PI,5.)*81./121.)) -.4)/10. ));
	//return r + (FragColor[1]*(( .25*(2.+sin(time*PI*121./81.)) -.4)/10. ));
    return r + (FragColor[1]*(( .25*(2.+sin(time*pow(PI,5.)*81./121.)) -.5)/100. ));
}

void main( void ) {
	vec2 p = cartesian();

	float tm = time/100.;

	float ang = atan(p.y,p.x);
	float dist = length(p);
	ang += log(dist)+tm; //spiral and animation
	ang += cos(dist);
	ang = mod(ang, PI/3.0);

	float ang2 = ang+PI*2.0; //change the multiplier

	vec3 col = hsb2rgb(vec3(ang, .25, .75));
	vec3 col2 = hsb2rgb(vec3(ang2, .25, .75));
	col = mix(col, col2, dist)* sqrt(2.)/2. ;

	FragColor[1] = vec4(col, 1.0);

	vec3 t = vec3( .5*(1.+cos(tm)), .5*(1.+sin(tm)), 1.-(.5*(1.+cos(tm))) );

	vec2 position = ( gl_FragCoord.xy / resolution.xy );
	vec4 me = texture(backbuffer, position);
	float rnd1 = mod(fract(sin(dot(position + tm * 0.001, vec2(14.9898,78.233))) * 43758.5453), 1.0);
	float rnd2 = mod(fract(sin(dot(position + tm * 0.001, vec2(24.9898,44.233))) * 27458.5453), 1.0);
	float nudgex = 20.0 * cos(tm * 0.03775);
	float nudgey = 20.0 * cos(tm * 0.02246);
	float ratex = -0.005 + 0.02 * (0.5 + 0.5 * normalize(nudgex * position.y + tm * 0.137));
	float ratey = -0.005 + 0.02 * (0.5 + 0.5 * normalize(nudgey * position.x + tm * 0.262));

	vec4 new = vec4(col, 1.0);

	if (dist > .00390625) {
		float multx = 1.0 - ratex;
		float multy = 1.0 - ratey;
		float jitterx = 1.1 / resolution.x;
		float jittery = 1.1 / resolution.y;
		float offsetx = (ratex - jitterx) * 0.5;
		float offsety = (ratey - jittery) * 0.5;
		vec2 bias = vec2(position.x * multx + offsetx + jitterx * rnd1 , position.y * multy + offsety + jittery * rnd2);
		vec4 source = texture(backbuffer, bias);
		new.r = source.r ;
		new.g = source.g ;
		new.b = source.b ;
	}

	float mx = 192.0/255.0;
	new.rgb = new.rgb*mx + me.rgb * (1.0-mx);

	new = postfxnvp(new);

	FragColor[0] = new;
}
