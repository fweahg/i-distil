precision highp float;

#define pi 3.1415926535897932384626433832795

uniform vec2 resolution;
uniform vec2 touch ;
uniform vec3 pointers[10];
uniform float time;
uniform float startRandom;

#define ms 2.*(2. * (-.5 + touch/resolution))
#ifndef FNC_SRANDOM
#define FNC_SRANDOM
float srandom(in float x) {
  return -1. + 2. * fract(sin(x) * 43758.5453);
}

float srandom(in vec2 st) {
  return -1. + 2. * fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float srandom(in vec3 pos) {
  return -1. + 2. * fract(sin(dot(pos.xyz, vec3(70.9898, 78.233, 32.4355))) * 43758.5453123);
}

float srandom(in vec4 pos) {
    float dot_product = dot(pos, vec4(12.9898,78.233,45.164,94.673));
    return -1. + 2. * fract(sin(dot_product) * 43758.5453);
}

vec2 srandom2(in vec2 st) {
    const vec2 k = vec2(.3183099, .3678794);
    st = st * k + k.yx;
    return -1. + 2. * fract(16. * k * fract(st.x * st.y * (st.x + st.y)));
}

vec3 srandom3(in vec3 p) {
    p = vec3( dot(p, vec3(127.1, 311.7, 74.7)),
            dot(p, vec3(269.5, 183.3, 246.1)),
            dot(p, vec3(113.5, 271.9, 124.6)));
    return -1. + 2. * fract(sin(p) * 43758.5453123);
}

vec2 srandom2(in vec2 p, const in float tileLength) {
    p = mod(p, vec2(tileLength));
    return srandom2(p);
}

vec3 srandom3(in vec3 p, const in float tileLength) {
    p = mod(p, vec3(tileLength));
    return srandom3(p);
}

#endif

#ifndef NOISED_RANDOM2_FNC
#define NOISED_RANDOM2_FNC srandom2
#endif

#ifndef NOISED_RANDOM3_FNC
#define NOISED_RANDOM3_FNC srandom3
#endif

#ifndef FNC_NOISED
#define FNC_NOISED

// return gradient noise (in x) and its derivatives (in yz)
vec3 noised (in vec2 p) {
    // grid
    vec2 i = floor( p );
    vec2 f = fract( p );

    // quintic interpolation
    vec2 u = f * f * f * (f * (f * 6. - 15.) + 10.);
    vec2 du = 30. * f * f * (f * (f - 2.) + 1.);

    vec2 ga = NOISED_RANDOM2_FNC(i + vec2(0., 0.));
    vec2 gb = NOISED_RANDOM2_FNC(i + vec2(1., 0.));
    vec2 gc = NOISED_RANDOM2_FNC(i + vec2(0., 1.));
    vec2 gd = NOISED_RANDOM2_FNC(i + vec2(1., 1.));

    float va = dot(ga, f - vec2(0., 0.));
    float vb = dot(gb, f - vec2(1., 0.));
    float vc = dot(gc, f - vec2(0., 1.));
    float vd = dot(gd, f - vec2(1., 1.));

    return vec3( va + u.x*(vb-va) + u.y*(vc-va) + u.x*u.y*(va-vb-vc+vd),   // value
                ga + u.x*(gb-ga) + u.y*(gc-ga) + u.x*u.y*(ga-gb-gc+gd) +  // derivatives
                du * (u.yx*(va-vb-vc+vd) + vec2(vb,vc) - va));
}

vec4 noised (in vec3 pos) {
    // grid
    vec3 p = floor(pos);
    vec3 w = fract(pos);

    // quintic interpolant
    vec3 u = w * w * w * ( w * (w * 6. - 15.) + 10. );
    vec3 du = 30.0 * w * w * ( w * (w - 2.) + 1.);

    // gradients
    vec3 ga = NOISED_RANDOM3_FNC(p + vec3(0., 0., 0.));
    vec3 gb = NOISED_RANDOM3_FNC(p + vec3(1., 0., 0.));
    vec3 gc = NOISED_RANDOM3_FNC(p + vec3(0., 1., 0.));
    vec3 gd = NOISED_RANDOM3_FNC(p + vec3(1., 1., 0.));
    vec3 ge = NOISED_RANDOM3_FNC(p + vec3(0., 0., 1.));
    vec3 gf = NOISED_RANDOM3_FNC(p + vec3(1., 0., 1.));
    vec3 gg = NOISED_RANDOM3_FNC(p + vec3(0., 1., 1.));
    vec3 gh = NOISED_RANDOM3_FNC(p + vec3(1., 1., 1.));

    // projections
    float va = dot(ga, w - vec3(0., 0., 0.));
    float vb = dot(gb, w - vec3(1., 0., 0.));
    float vc = dot(gc, w - vec3(0., 1., 0.));
    float vd = dot(gd, w - vec3(1., 1., 0.));
    float ve = dot(ge, w - vec3(0., 0., 1.));
    float vf = dot(gf, w - vec3(1., 0., 1.));
    float vg = dot(gg, w - vec3(0., 1., 1.));
    float vh = dot(gh, w - vec3(1., 1., 1.));

    // interpolations
    vec4 ret = vec4(
    	va + u.x*(vb-va) + u.y*(vc-va) + u.z*(ve-va) +
    	u.x*u.y*(va-vb-vc+vd) +
    	u.y*u.z*(va-vc-ve+vg) +
    	u.z*u.x*(va-vb-ve+vf) +
    	(-va+vb+vc-vd+ve-vf-vg+vh) * u.x*u.y*u.z,    // value
      ga + u.x*(gb-ga) + u.y*(gc-ga) + u.z*(ge-ga) +
      u.x*u.y*(ga-gb-gc+gd) +
      u.y*u.z*(ga-gc-ge+gg) +
      u.z*u.x*(ga-gb-ge+gf) +
      (-ga+gb+gc-gd+ge-gf-gg+gh) * u.x*u.y*u.z +   // derivatives
      du * (
      vec3(vb,vc,ve) - va +
      u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) +
      u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) +
      u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh) )
      );
    return ret;
}
#endif

vec3 hue2rgb(const in float hue) {
    float R = abs(hue * 6.0 - 3.0) - 1.0;
    float G = 2.0 - abs(hue * 6.0 - 2.0);
    float B = 2.0 - abs(hue * 6.0 - 4.0);
    return clamp(vec3(R,G,B), .0, 1.);
}

vec3 hsl2rgb(const in vec3 hsl) {
    vec3 rgb = hue2rgb(hsl.x);
    float C = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;
    return (rgb - 0.5) * C + hsl.z;
}

float rgb2hue(const in vec3 c) {
    vec4 K = vec4(0.0, -0.33333333333333333333, 0.6666666666666666666, -1.0);
    vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
    vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);
    float d = q.x - min(q.w, q.y);
    return abs(q.z + (q.w - q.y) / (6. * d + 1e-10));
}

vec3 rgb2hcv(const in vec3 rgb) {
    vec4 P = (rgb.g < rgb.b) ? vec4(rgb.bg, -1.0, 2.0/3.0) : vec4(rgb.gb, 0.0, -1.0/3.0);
    vec4 Q = (rgb.r < P.x) ? vec4(P.xyw, rgb.r) : vec4(rgb.r, P.yzx);
    float C = Q.x - min(Q.w, Q.y);
    float H = abs((Q.w - Q.y) / (6.0 * C + 1e-10) + Q.z);
    return vec3(H, C, Q.x);
}

vec3 rgb2hsl(const in vec3 rgb) {
    vec3 HCV = rgb2hcv(rgb);
    float L = HCV.z - HCV.y * 0.5;
    float S = HCV.y / (1.0 - abs(L * 2.0 - 1.0) + 1.e-10);
    return vec3(HCV.x, S, L);
}

vec4 heat( vec4 c ){
	float t = c.r + c.g + c.b;
	t = clamp( t, 0., 1. );
	vec3 rgb = vec3( 3. * ( t - (0./6.) ), 0., 0. );
	if( t >= (1./3.) ){
		rgb.rg = vec2( 1., 3. * ( t - (1./3.) ) ); }
	if( t >= (2./3.) ){
		rgb.gb = vec2( 1., 3. * ( t - (2./3.) ) ); }
	return vec4(rgb, t/3.);

}

vec2 taylorInvSqrt(in vec2 r) {
	return 1.79284291400159 - 0.85373472095314 * r;
}

void main(void) {
	vec2 rs =resolution;
	vec2 scl = rs.x>rs.y?vec2(rs.x/rs.y, 1.):vec2(1., rs.y/rs.x);
	vec3 noise, noise1, noise2, noise3;
	vec4 color, color1, color2, color3;
	float zm = -12.; //12.
	float t = time;

	vec2 p =  2.*( -resolution/2. + pointers[0].xy) / min(resolution.x, resolution.y) * scl ;
  vec2 xc = .5*( pi + pi*startRandom) * vec2(sin(.005*time), cos(.005*time));

  zm = zm * .1;

  if (zm >= -0.001 && zm <= 0.0) zm = -.1;
  if (zm >= 0.0 && zm <= 0.001) zm = .1;

  vec2 uv = zm * (-1. + 2.*gl_FragCoord.xy/rs) * scl ;
  float muv = 1.-smoothstep(24.*pi/12., -32.*pi/12., distance(vec2(.0,.0), uv)) ;
  vec3 msk0 = vec3(smoothstep(2., -1.,distance(vec2(.0,.0), uv) ));
  vec3 msk1 = vec3(smoothstep(1.79284291400159, -1.79284291400159,distance(vec2(.0,.0), uv)) );

  //uv = uv * pow(dot(muv,muv), 5.*ms.y) ; 
  // uncomment with the mask layer end part 
  uv = uv * dot(muv,muv) ;

  noise1 = 3.5*vec3(noised(11.*(xc+zm*uv)).r);
  noise2 = 1.5*vec3(noised(29.*(zm*xc+uv)).r);
  noise3 = 2.*vec3(noised(47.*(xc+zm+uv)).r);
  //noise += vec3(noised(71.*(zm*xc+uv)).r);
  //noise = vec3(noised(97.*(zm*xc+uv)).r);

  noise = (noise1 + noise2 + noise3) / (3.+1.*noise1);// 3.5

  color = normalize(.06125*noised(2.7*noise));

  color1 = vec4( vec3(.5) + .5*(normalize(noise1) - vec3(.5)), 0.);
  color2 = vec4( vec3(.5) + .5*(normalize(noise2) - vec3(.5)), 0.);
  color3 = vec4( vec3(.5) + .5*(normalize(noise3) - vec3(.5)), 0.);

  color = vec4(color1.r * color2.r, color2.g*color3.g, color3.b*color1.b, 1.0);
  color = noised(-2.7*noise);

  vec3 hsl = rgb2hsl(color.rgb);

  color = vec4(hsl2rgb( vec3(
  	hsl.r + (1./3. * (0. + sin(.5*time))), // .05
  	(hsl.g + 12.)* .5 , // + 2.*sin(time/3.) , //.6
  	hsl.b * 1.0) //+ .3
  	), 1.);

  color = 0.5 + ( (2./3. * normalize(mix(color, vec4(1./3.), 2./3.)) ) - vec4(.51));

  vec3 m = vec3(color.r + color.g + color.b) ;
  color = heat(color);
  color = vec4(12.*msk1*msk0*m*vec3(pow(msk1*(color.rgb),vec3(0.85373472095314))), msk0) ;
  vec4 msk3 = vec4(vec3(smoothstep(1., .9,distance(vec2(.0,.0), uv)) ),1.);
  color = vec4(2.7*msk1, 1.) * msk3 * smoothstep( .0625, .0625, color);

  gl_FragColor = color;


/*
  if(gl_FragCoord.x > resolution.x / 2.){
    gl_FragColor = msk3 * vec4(vec3(m), msk3) ; //color
  }else if(gl_FragCoord.x < resolution.x / 2. &&
        gl_FragCoord.y < resolution.y / 2.){
      gl_FragColor = vec4(1.-uv*pow(dot(muv,muv),5.*ms.y) ,.0, .0);
  }
*/
}
