//#version 320 es

// adapted from shadertoy
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

//out vec4 gl_FragColor;

uniform vec2 resolution;
uniform float time;
uniform vec2 touch;
uniform vec4 date;
uniform sampler2D backbuffer;

#define pi 3.1415926535897932384626433832795
#define S(a, b, t) smoothstep(a, b, t)
#define NUM_LAYERS 4.
//#define SIMPLE
#define ms 2.*(-.5+(touch/resolution))

float z;

float N21(vec2 p) {
	vec3 a = fract(vec3(p.xyx) * vec3(213.897, 653.453, 253.098));
    a += dot(a, a.yzx + 79.76);
    return fract((a.x + a.y) * a.z);
}

vec2 GetPos(vec2 id, vec2 offs, float t) {
    float n = N21(id+offs);
    float n1 = fract(n*10.);
    float n2 = fract(n*100.);
    float a = t+n;
    return offs + vec2(sin(a*n1), cos(a*n2))*.4;
}

float GetT(vec2 ro, vec2 rd, vec2 p) {
	return dot(p-ro, rd);
}

float LineDist(vec3 a, vec3 b, vec3 p) {
	return length(cross(b-a, p-a))/length(p-a);
}

float df_line( in vec2 a, in vec2 b, in vec2 p)
{
  vec2 pa = p - a, ba = b - a;
	float h = clamp(dot(pa,ba) / dot(ba,ba), 0., 1.);
	return length(pa - ba * h);
}

float line(vec2 a, vec2 b, vec2 uv) {
    float r1 = .04;
    float r2 = .01;

    float d = df_line(a, b, uv);
    float d2 = length(a-b);
    float fade = S(1.5, .5, d2);

    fade += S(.05, .02, abs(d2-.75));
    return S(r1, r2, d)*fade;
}

float NetLayer(vec2 st, float n, float t) {

    vec2 id = floor(st)+n;
    st = fract(st)-.5;

    vec2 p[9];
    int i=0;
    for(float y=-1.; y<=1.; y++) {
    	for(float x=-1.; x<=1.; x++) {
            p[i++] = GetPos(id, vec2(x,y), t);
    	}
    }

    float m = 0.;
    float sparkle = 0.;

    for(int i=0; i<9; i++) {
        m += line(p[4], p[i], st);

        float d = length(st-p[i]);

        float s = (.005/(d*d));
        s *= S(1., .7, d);
        float pulse = sin((fract(p[i].x)+fract(p[i].y)+t)*5.)*.4+.6;
        pulse = pow(pulse, 20.);

        s *= pulse;
        sparkle += s;
    }

    m += line(p[1], p[3], st);
	  m += line(p[1], p[5], st);
    m += line(p[7], p[5], st);
    m += line(p[7], p[3], st);

    float sPhase = (sin(t+n)+sin(t*.1))*.25+.5;
    sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;
    m += sparkle*sPhase;

    return m;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
  vec2 uv = 2.*(-.5+(fragCoord/resolution));
  vec2 M = vec2(.1,-.1);
  float t = .1*(10.+sin(time/10.));
  //float fft, glow;

  M *= vec2( 1./(pow(10., t)*log(t)) );
  vec2 st = uv;

  float m = 0.;
  for(float i=0.; i<1.; i+=1./NUM_LAYERS) {
        z = fract(t+i)/(2.);
        float size = mix(15., 1., .5+(2.*(z-.5)));
        float fade = (S(0., .6, z)*S(1., .8, z));
        m +=  fade * NetLayer(st*size-M*z, i, time);//fade *
    }

    vec3 baseCol = vec3(sin(t), cos(t*.4), -sin(t*.24))*.4+.6;
    vec3 col = baseCol*m;
    col += baseCol;

    #ifdef SIMPLE
     uv *= 10.;
     col = vec3(1.)*NetLayer(uv, 0., time);
     uv = fract(uv);
     //if(uv.x>.98 || uv.y>.98) col += 1.;
    #else
     col *= 1.-3.*dot(uv-ms, uv-ms);
     t = 10.+(sin(time/10.)); // 230
     col *= S(0., 20., t)*S(224., 200., t);
    #endif

    fragColor = vec4(col,1);
}

void main() {
	vec4 fragment_color;
	mainImage(fragment_color, gl_FragCoord.xy);
	gl_FragColor = fragment_color;
}
