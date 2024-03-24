//#version 320 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

//out vec4 gl_FragColor;

uniform vec2 resolution;

uniform vec2 touch;

uniform float time;

#define mouse 5.*(-1.+2.*(touch/resolution))

#define pi 3.1415926535897932384626433832795


// Plot a line on Y using a value between 0.0-1.0

float plot(vec2 st, float pct){
	return smoothstep( pct-0.02, pct, st.y) -
				 smoothstep( pct, pct+0.02, st.y);

}

float h(float x,float d) {
	return sqrt(pow((d-sqrt(pow(x/2.,2.))),2.))-(d-sqrt(pow(x/2.,2.)));
}

float f1(float t){ return fract(t) ;}
float f2(float t){ return floor(t) ;}
float f3(float t){ return 1. - fract(t) + 2.*fract(t/2.) ;}
float f4(float t){ return f2(t/2.) + .5*( f1(t) * f3(t) * (f3(t)-1.) ) ;}


void main() {
	vec2 rs = resolution;
	vec2 scl = rs.x>rs.y?vec2(rs.x/rs.y, 1.):vec2(1., rs.y/rs.x);

	// center screen to
	vec2 orig = vec2(.0, .0);

	vec2 st = 6. * (-1.+2.*(gl_FragCoord.xy/resolution)) * scl + orig ;// + mouse
	vec3 c;

	// Smooth interpolation between 0.1 and 0.9
	//float y = smoothstep(0.1,mouse.x,st.x);
	float t = st.x;

	float y1 = f3(t) ;
	float y2 = (f1(t) * f3(t) * (f3(t)-1.))/2.;
	float y3 = floor(t/2.) + .5*(fract(t) * f3(t) * (f3(t)-1.)) ;

	//y *= h(st.x, mouse.y) ;

	//axes and color
	c = plot(st.xy, 0.) * vec3(.5);
	c+= plot(st.yx, 0.) * vec3(.5);

	c+= plot(st, y1) * vec3(.3, .3, .7);
	c+= plot(st, y2) * vec3(.8, .2, .4);
	c+= plot(st, y3) * vec3(.7, .6, .3);

	gl_FragColor = vec4(vec3(c),1.0);

}
