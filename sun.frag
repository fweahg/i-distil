#version 320 es

#ifdef GL_ES
precision highp float;
#endif

// original https://www.shadertoy.com/view/lsVyzV
out vec4 FragColor;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D backbuffer;

// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// Rotation matrix, it does a big impact, as usual.
#define pi 3.1415926536
//#define angle2 pow(exp(1.),2.)/sqrt(pow(exp(1.), 2.)-1.)
//#define angle2 sqrt(2.)/sqrt(pow(exp(1.), 2.)-1.)
#define angle pi/3.

const mat2 m = mat2( .8*sin(angle), 1.2*cos(angle), -1.2*cos(angle), .8*sin(angle) );
//const mat2 m2 = mat2( .8*sin(angle2), 1.2*cos(angle2), -1.2*cos(angle2), .8*sin(angle2) );

// Time simplification and easier overall speed control.
#define time time * .125

// Just a simple checker-like pattern.
// Not even sure if we can call it noise.
float squareNoise( in vec2 x )
{
    return cos(x.x) * sin(x.y);
}

// Six octave FBM square noise (3 seems enough).
float fbm6( vec2 p )
{
    float f = 0.0;
    f += 0.500000 * (0.5+0.5*squareNoise( p )); p = m * p * 2.02;
    f += 0.250000 * (0.5+0.5*squareNoise( p )); p = m * p * 2.03;
    f += 0.125000 * (0.5+0.5*squareNoise( p )); p = m * p * 2.01;
    //f += 0.062500 * (0.5+0.5*squareNoise( p )); p = m * p * 2.04;
    //f += 0.031250 * (0.5+0.5*squareNoise( p )); p = m * p * 2.01;
    //f += 0.015625 * (0.5+0.5*squareNoise( p ));
    return f / 0.96875;
}

// This two hash voronoi might sucks. At least it seems ugly to me.
// I guess i should use IQ's version. But really don't have time today.
float r(float n)
{
     return fract(cos(n*72.42)*173.42);
}

vec2 r(vec2 n)
{
     return vec2(r(n.x*63.62-234.0+n.y*84.35),r(n.x*45.13+156.0+n.y*13.89));
}

float voronoi2D(in vec2 n)
{
    float dis = 2.0;
    for (int y= -1; y <= 1; y++)
    {
        for (int x= -1; x <= 1; x++)
        {
            // Neighbor place in the grid.
            vec2 p = floor(n) + vec2(x,y);

            float d = length(r(p) + vec2(x, y) - fract(n));
            if (dis > d)
            {
                 dis = d;
            }
        }
    }

    return 1.0 - dis;
}

// Four octave voronoi FBM.
float fbm4( vec2 p )
{
    float f = 0.0;
    f += 0.5000 * voronoi2D( p ); p = p * 2. * m;// p = -m * p * 2. * m2;
    f += 0.2500 * voronoi2D( p ); p = p * 2. * m;// p = -m * p * 2. * m2;
    f += 0.1250 * voronoi2D( p ); p = p * 2. * m;// p = -m * p * 2. * m2;
    f += 0.0625 * voronoi2D( p );
    return f;
}

float GetFBM( vec2 q, out vec4 ron)
{
    // Base motion.
    float ql = length( q * m );

    // First layer.
    vec2 o;

    // Vice versing fbm's addition for points gives nice result.
    // Note that we pass q length inside outer fbm4 to get a circle pattern.
    o = vec2(fbm4(vec2(0.5 * ql - time) + fbm6( vec2(2.0 * q + vec2(q)))));

    // Second layer. Note that we use previous result as input.
    vec2 n;
    n = vec2(fbm4(q + fbm6( vec2(2.0 * o + vec2(o)))));

    // Sum of points with increased sharpness.
    vec2 p = 4.0 * o + 6.0 * n;
    float f = 0.5 + 0.5 * fbm6(p);

    // I have seen that cubic mixing a couple of times
    // is it just gives a nice result, or there is something
    // behind it? Anyone?
    f = mix( f, f * f * f * 3.5, f * abs(n.y));

    f *= 1.0 - 0.5 * pow( f, 8.0 );

    ron = vec4( o, n );

    return f;
}

// Main color mixing function.
vec3 GetColor(vec2 p)
{
    vec4 on = vec4(0.);

    float f = GetFBM(p, on);

    vec3 col = vec3(0.0);

    // You can play with this. Nothing really complex.
    col = mix( vec3(0.78, 0.45, 0.06), vec3(0.35, 0.0, 0.4), f );
    col = mix( col, vec3( 0.81, 0.55, 0.0), dot(on.xy, on.zw));

    return col * col * 4. * 0.4545;
}

#define sz 3.
void main(void)
{
    // Aspect ratio - UV normalization.
    float rt = resolution.y / resolution.x;
    vec2 uv =(2. * gl_FragCoord.xy - resolution.xy ) / resolution.y;
    vec2 p = (2. * gl_FragCoord.xy - resolution.xy ) / resolution.y;
    vec2 pos = .5-mouse;
    vec3 col;

    // Zoom level.
    p *= 5.;

    // Time varying pixel color.
    if ( dot(p, p) < sz*sz) {
    	col = GetColor(p) * ( sz*sz - dot(p, p) )/sz;

    }

    vec2 tp = (uv*vec2(.5*rt, .5) + .5);
    vec4 tx = texture(backbuffer, tp*.975 + .0125 );

    col = mix(col-.125, tx.rgb*.92, .95);
    // Output to screen.
    FragColor = vec4(col, 1.0) ;
}












