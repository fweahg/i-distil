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

uniform sampler2D backbuffer;///min:nn;mag:n;s:c;t:c;

vec4 tex,tx,c,a,cs;
vec2 r, scl, uv, orig, ms, pnt, p1,p2;
float t,px,s,sw,bt,l,b;

vec4 drw(float shape, vec3 color){
	return shape * vec4(color.r, color.g, color.b, shape);
}
float pen(vec2 pos, float width){
	return 1.-smoothstep(width, -width ,
		(.03125-(length(distance(pos,uv))*(dot(pos,uv)/distance(uv,pos)))) );
}
      
void main(void) {
	r = resolution; scl = r.x>r.y?vec2(r.x/r.y, 1.):vec2(1., r.y/r.x);
	uv = vec2(-.25,-.25)+.0625*(2. * (-.5 + (gl_FragCoord.xy / resolution.xy))) * scl;
	ms = (2. * (-.5 + (touch / r))) * scl;
	pnt= (2. * (-.5 + (pointers[0].xy / resolution.xy))) * scl;
	orig = vec2(.03125, .0);
	b = 5.*37.;	
	px =27./(r.x*r.y);
	tex = texture(backbuffer, gl_FragCoord.xy/resolution);
	t = time*18.5;//shaping time
	if (t >= 2.*b*pi/2.) t = (2.*b*pi/2.) + 1.; // +-pi, +-1.
	bt = round(.5*(1.+sin(time/(2.*pi)))); //time to accumulat + and -
	//signed size of the pen fade in-out and wide-strength zone
	if (bt > .5) { sw = 3600. ;} else {sw = -14400. ;} //ex: 60.*60. 120.*120.
	p1 = vec2(.5*sin(t), -1.75*cos(t)); //t dependent sample rate hw clock 200 800 ... mhz
	p2 = vec2(-.5*sin(t),-1.75*cos(t)); //p1 p2 as in a complex plan

	s = pen(-p1, (sw)*px);
	s += pen(p2, (sw)*px);
	c = drw(s, vec3(.012, .011, .014));

	l = length(distance(orig,p1));
	if (l == 0.) l = 1./3e15;
	a = vec4(l);
	cs = c;
	tx = tex-c ;
	c = fma(a,tx,c)/l;//fma(a,b,c) a * b + c
	//c = (c + (l)*(tex - c))/(l);

	//vec4 mc = pow(.75-vec4(dot(.25-2.*uv,vec2(1.0-distance(vec2(.0),5./3.*uv)))),vec4(2.));
	float mc = pow(.75-dot(.25-uv, 1.0-((5./3.)*uv)), 2.);
	c += (1./(128.*9.))*refract(c, tx,
		mc*(1./dot( mc/l, dot( dot(uv*mc, vec2(tx)/mc), dot(uv*mc,vec2(c)/mc) ))) ); //meaningless
	gl_FragColor = vec4(c);
}
