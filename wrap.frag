#version 320 es
precision highp float;

//base wrap2 on shadertoy
//some change to do something on little config

uniform vec2 resolution;
uniform float time;
uniform vec2 touch;
uniform vec4 date;

#define ms vec2(4.*(-.5 + touch/resolution))
#define iTime time

#define pi 3.1415926535897932384626433832795
#define e exp(1.0)

out vec4 gl_FragColor;

const float j = 1./32.;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

	float s = -.03125, v = 2.;
	vec2 uv = (fragCoord / resolution.xy) * 2.0 - 1.;
  float t = (iTime-1.79284291400159*pow(e,1./e))*e; //58.0;
	vec3 col = vec3(0);
  vec3 init = vec3(.3, .3 , 1.) * 
  						vec3(cos(t*j),
  							 sin(t*j),
  							 t*j);//(sin(.0032),.35-cos(.005),.008*t)
  							 
  mat3 mt = -mat3((1.-cos(t*j))*vec3(cos(t*j), sin(t*j), -sin(t*j)), 
  							 (1.-cos(t*j))*vec3(-sin(t*j), cos(t*j), sin(t*j)),
  							 (1.-cos(t*j))*vec3(sin(t*j), -sin(t*j), cos(t*j))
  							 );

	for (int r = 0; r <= 27; r++)
	{
		vec3 p = init + s * vec3(uv, 0.05)*mt*inverse(transpose(mt));
		p.z = fract(p.z);
    // Thanks to Kali's little chaotic loop...
		for (int i=0; i < 10; i++)
				p = (abs(p * 2.04) / dot(p, p)) - (2.9/2.);// e/2.
		v += pow(dot(p, p), e ) * 1./4.;

		col +=  v * .00003 * vec3(
			v*0.2 + .4,
			12. - s*2.,
			.1 + v*.75);

		s += j;
	}

	fragColor = vec4(clamp(col, .0, 1.0), 1.0);
}

void main() {
	vec4 fragment_color;
	mainImage(fragment_color, gl_FragCoord.xy);
	gl_FragColor = fragment_color;
}
