//#extension GL_OES_rgb8_rgba8:enable
//#extension GL_ARM_rgba8:enable
//#extension GL_EXT_sRGB:enable

precision highp float;

uniform vec2 resolution;
uniform vec2 mouse;

#define ms 4.*(mouse-.5)
#define tg (ms.x/abs(ms.x))

float f(float x){
	return abs(x);
}

float g(float x){
	return -abs(x-1.);
}

float h(float x){
	return (f(x)+g(x)+1.)/2.;
}

float o(float x){
	return h(x+1.)-h(x);
}

float p(float x, float m, float d){
	float p=ms.y;
	float r = m*(x-d);
	if (ms.x<-1. && ms.y<-1.5) p=.5;
	if (ms.x>=-1. && ms.y<-1.5) p=1.;
	return pow(o(r), p);
}

void main(void) {
	float fr, fg, fb, fy, fx;
	vec3 col;
	vec2 uv = 2.*((gl_FragCoord.xy / resolution.xy)-.5);

  fr = p(uv.y, 1.67, .9);
  fb = p(uv.y, 1.67, .3);
  fg = p(uv.y, 1.67, -.3);
  fr+= p(uv.y, 1.67, -.9);

  col = (.5)*(uv.x + vec3(fr, fg, fb));
  //col = pow(col, vec3(pow(3./2., tg)));

  if (distance(uv.x+1., .5) < .002) col = vec3(0., 0., 0.);
  if (distance(uv.x+1., fr) < .002) col = vec3(.5, 0., 0.);
  if (distance(uv.x+1., fg) < .002) col = vec3(0., .5, 0.);
  if (distance(uv.x+1., fb) < .002) col = vec3(0., 0., 5.);

  if (uv.y>.95) col = vec3(uv.x+1.)/2.;

	gl_FragColor = vec4(col, 0.5);
//.                          ^^^
/*
qu'est-ce que ca veut dire en fit ce truc
ds² = -1/(1-2m/r) dr² - r² * (dθ² + sin²θdφ²)+(1 - 2m/r) dt²
<=> g disparu dans (les noix de pécan ca peut peut être marcher)
ds² = -4m(2m + ρ²)dρ² - (2m + ρ²)²(dθ² + sin²dφ²) + ρ/(2m + ρ) dt²
/*
}
