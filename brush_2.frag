#version 320 es
precision highp float;

#define pi 3.1415926535897932384626433832795
#define e exp(1.0)

out vec4 gl_FragColor;

uniform vec2 resolution;
uniform vec2 touch;
uniform vec3 pointers[10];

uniform float time;
uniform float startRandom;

//uniform sampler2D backbuffer;///min:nn;mag:n;s:c;t:c;
uniform sampler2D brushcut;///min:ll;mag:l;s:m;t:m;

vec4 tex, tx, c;
vec2 r, scl, uv, txc, atxc,  orig, ms, pnt;
float px, s1, s2, s3, t;

float pen(vec2 pos, float width){
	return smoothstep(width, 3.*px , pow(distance(uv, pos), 2.));
}

vec4 drw(float shape, vec3 color){
	return shape * vec4(color.r, color.g, color.b, shape);
}

void main(void) {
	r = resolution;
	scl = r.x>r.y?vec2(r.x/r.y, 1.):vec2(1., r.y/r.x);
	//tex = texture(backbuffer, gl_FragCoord.xy/resolution);
	uv = (2. * (-.5 + (gl_FragCoord.xy / resolution.xy))) * scl;

	txc = vec2( .5*(uv.x+1.), .5*(uv.y+1.) );

	orig = vec2(.0, .0);
	ms = (2. * (-.5 + (touch / r))) * scl;
	pnt= (2. * (-.5 + (pointers[0].xy / resolution.xy))) * scl;

	t = pi*time/24.;

	px = 4./min(r.x ,r.y);

	vec2 p1,p2,p3;
	p1 = vec2(.0, .125) + .25*vec2(cos(3.*t),sin(5.*t));
	p2 = vec2(.0, .175) + .375*vec2(cos(5.*(t+2.*pi/3.)),sin(5.*(t+2.*pi/3.)));
	p3 =-vec2(.0, .125) + .5*vec2(cos(7.*(t+4.*pi/3.)),sin(5.*(t+4.*pi/3.)));

	s1 = pen(ms+p1, 25.*px);
	s2= pen(ms+p2, 37.5*px);
	s3= pen(ms+p3, 50.*px);

	//c = drw(s, vec3(1., 1., 1.));

	tx = step(.5, 
			 (s1*vec4(.8,1.,1.,1.) + 
		    s2*vec4(1.,.8,1.,1.) + 
		    s3*vec4(1.,1.,.8,1.)
		   )/3.) *
		    texture(brushcut, txc*sqrt(3./(s1*s1+s2*s2+s3*s3)) );

	c =  tx + (step(.5, 1.-((s1+s2+s3)/3.))*(texture(brushcut, txc))) ;

	gl_FragColor = c;
}
