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

vec4 tex, tx, txz, tm, c, sc;
vec2 r, scl, uv, txc, atxc,  orig, ms, pnt;
float px, s, s1, s2, s3, msk, l, t, d;

float pen(vec2 pos, float width){
	return smoothstep(width, 3.*px , pow((1./128.)*distance(uv, pos), 1./2.));
}

vec4 drw(float shape, vec3 color){
	return shape * vec4(color.r, color.g, color.b, shape);
}

void main(void) {
	r = resolution;
	scl = r.x>r.y?vec2(r.x/r.y, 1.):vec2(1., r.y/r.x);
	//tex = texture(backbuffer, gl_FragCoord.xy/resolution);
	uv = 2.*(2. * (-.5 + (gl_FragCoord.xy / resolution.xy))) * scl;

	orig = vec2(.0, .0);
	ms = 2.*(2. * (-.5 + (touch / r))) * scl;
	pnt= (2. * (-.5 + (pointers[0].xy / resolution.xy))) * scl;

	t = pi*time/24.;

	px = 4./min(r.x ,r.y);
	d = length(distance(orig,ms));

	vec2 p1,p2,p3;
	//p1 = vec2(.0, .125) + .25*vec2(cos(3.*t),sin(5.*t));
	//p2 = vec2(.0, .175) + .375*vec2(cos(5.*(t+2.*pi/3.)), sin(5.*(t+2.*pi/3.)));
	p3 = vec2(.0, .125) + 1.5*vec2(cos(5.*(t+4.*pi/3.)), sin(7.*(t+4.*pi/3.)));

	//s1= pen(p1, 10.*px);
	//s2= pen(p2, 25.*px);
	s3= pen(p3, 50.*px);

	l = length(s1+s2+s3);
	s = s1+s2+s3;

	txc = -.5*ms + .5*(vec2( uv.x, uv.y )+1.);

	//tx = step(.75, s)  * texture(brushcut, (e*txc)/(exp(1./l)) );
	//tx = step(.75, s1)  * texture(brushcut, s1*txc);
	//tx+= step(.75, s2)  * texture(brushcut, s2*(uv+ms+p2));

  txz  = .6 * s3 * texture(brushcut, 8./4.*s3*((txc+1./16.*p3)-3. /12. + (3./12.*ms))/length(s3) );
	txz += .6 * s3 * texture(brushcut, 6./4.*s3*((txc+2./16.*p3)+14./12. + (2./12.*ms))/length(s3) );
	txz += .6 * s3 * texture(brushcut, 3./4.*s3*((txc+3./16.*p3)+2. /12. - (2./12.*ms))/length(s3) );
	txz += .6 * s3 * texture(brushcut, 2./4.*s3*((txc+6./16.*p3)+6. /12. - (6./12.*ms))/length(s3) );
	txz += .6 * s3 * texture(brushcut, 1./4.*s3*((txc+8./16.*p3)+18./12. -(18./12.*ms))/length(s3) );
	txz += (vec4(s3)) * texture(brushcut, (txc-.5+.5*p3)/length(10.*s3) );

	txz /= 4.;
	txz = pow(txz + .58, vec4(5.5));

	tx += txz ;

	//msk = step( .75, s1 );
	//msk+= step( .75, s2 );
	msk+= step( .75, s3 );

	tm = (1.0-msk)*(texture(brushcut, txc));

	c = tx;

	gl_FragColor = c;
}
