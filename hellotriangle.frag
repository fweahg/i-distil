#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// source from shadertoy

#define pi 3.1415926535897932384626433832795

uniform vec2 resolution;
uniform float time;
uniform vec2 touch;
uniform vec4 date;

#define mouse (-.5 + touch/resolution)

mat4 rotate( float x, float y, float z ){
	float a = sin(x); float b = cos(x);
  float c = sin(y); float d = cos(y);
  float e = sin(z); float f = cos(z);

  float ac = a*c;
  float bc = b*c;

  return mat4( d*f,      d*e,       -c, 0.0,
               ac*f-b*e, ac*e+b*f, a*d, 0.0,
               bc*f+a*e, bc*e-a*f, b*d, 0.0,
               0.0,      0.0,      0.0, 1.0 );
}

mat4 ortho(float left,float right,float bottom,float top,float near,float far){
	return mat4(
    	2.0/(right-left), 0.0,                 0.0, -(right+left)/(right-left),
      0.0,						  2.0/(top-bottom),    0.0, -(top+bottom)/(top-bottom),
      0.0,              0.0,     -2.0/(far-near), -(far+near)/(far-near),
      0.0,              0.0,                 0.0, 1.0
  );
}

mat4 translate( float x, float y, float z ){
	return mat4(
		1.0, 0.0, 0.0, x,
		0.0, 1.0, 0.0, y,
		0.0, 0.0, 1.0, z,
		0.0, 0.0, 0.0, 1.0
		);
}

vec3 barycentric(vec2 a,vec2 b,vec2 c,vec2 p){
	vec2 ac = c-a;
	vec2 ab = b-a;
	vec2 ap = p-a;

	float acac = dot(ac,ac);
	float acab = dot(ac, ab);
  float acap = dot(ac, ap);
  float abab = dot(ab, ab);
  float abap = dot(ab, ap);

  float denom = acac* abab - acab * acab;
  if(denom == 0.0){

  	return vec3(-1.0,-1.0,-1.0);

  }else{
  	float u = (abab * acap - acab * abap) / denom;
  	float v = (acac * abap - acab * acap) / denom;

  	return vec3(1.0 - u - v,v,u);
  }
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
	//triangle verts
	vec4 a=vec4( 0.0, 0.5, -.5, 1.0);
	vec4 b=vec4(-0.5,-0.5, -.5, 1.0);
	vec4 c=vec4( 0.5,-0.5, -.5, 1.0);

	mat4 mv = rotate( 0.0, 2.*pi*fract(time/4.), -2.*pi*fract(time/4.))*translate(0.0, 0.0, -2.0);
	mat4 mv2 = rotate( 2.*pi*fract(time/4.), 0.0, 2.*pi*fract(time/4.))*translate(0.0, 0.0, -2.0);
	mat4 tr = translate(0.0, sin(2.*pi/3. + pi*time), 0.0);

	//convert to camera coordinate
	vec4 viewa = mv2*mv * a * tr;
  vec4 viewb = mv2*mv * b * tr;
  vec4 viewc = mv2*mv * c * tr;

  //orthogonal projection, convert view to clip coordinate
  mat4 proj = ortho(-1.0, 1.0, -1.0, 1.0,-1.0, 1.0);
  vec4 clipa = proj*viewa;
  vec4 clipb = proj*viewb;
  vec4 clipc = proj*viewc;

  //convert to clip normalized device coordinate
  vec2 ndca = clipa.xy/clipa.w;
  vec2 ndcb = clipb.xy/clipb.w;
  vec2 ndcc = clipc.xy/clipc.w;

  vec2 uv = fragCoord/resolution.xy;

  //convert normalized device coordinate
  vec2 ndcp = 2.*(uv*2.0 - 1.0);
	vec3 bary = barycentric(ndca.xy,ndcb.xy,ndcc.xy,ndcp);

  if(all(greaterThan(bary, vec3(0.0,0.0,0.0)))){
  	fragColor = vec4(bary, 1.0);
  }else{
    fragColor = vec4(0.3,0.3,0.3,1.0);
  }
}

void main() {
	vec4 fragment_color;
	mainImage(fragment_color, gl_FragCoord.xy);
	gl_FragColor = fragment_color;
}
