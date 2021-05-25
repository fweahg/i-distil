// PoVRay 3.7 Scene File " ... .pov"
// author:  ...
// date:    ...
//------------------------------------------------------------------------
#version 3.7;
// +w800 +h600 +a0.3 +RP5
// anim param : 
//clock 0..350 step 10 ; images 0..35
// +KFI0 +KFF35 +KI0 +KF350
//clock 0..359 step 1 ; imgs 0..359 
// +KFI0 +KFF359 +KI0 +KF359

// adding a photon{} block to global_settings activates photon mapping.
// photons also need to be adjusted for light sources and objects.

global_settings {
  assumed_gamma 1.8

  photons {
//    spacing 0.00002                 // specify the density of photons
//    spacing 0.0001                 // specify the density of photons
//    spacing 0.0002                 // specify the density of photons
//    spacing 0.0005                 // specify the density of photons
//    spacing 0.001                 // specify the density of photons
//    spacing 0.005
//    spacing 0.01
//    spacing 0.1
//    spacing 1

//    count 10000000               // alternatively use a total number of photons
    gather 20, 100            // amount of photons gathered during render [20, 100]
    //media max_steps [,factor]  // media photons
    //jitter 0.4                 // jitter phor photon rays
    //max_trace_level 5          // optional separate max_trace_level
    //adc_bailout 1/255          // see global adc_bailout
    //save_file "filename"       // save photons to file
    //load_file "filename"       // load photons from file
    //autostop 0                 // photon autostop option
    //radius 10                  // manually specified search radius
    // (---Adaptive Search Radius---)
    //steps 1
    //expand_thresholds 0.2, 40
  }

}

#default{ 
    finish{ ambient 0.1 
    diffuse 0.9 
    }
}
 
//------------------------------------------------------------------------
#include "colors.inc"
#include "textures.inc"
#include "glass.inc"
#include "metals.inc"
#include "golds.inc"
#include "stones.inc"
#include "woods.inc"
#include "shapes.inc"
#include "shapes2.inc"
#include "functions.inc"
#include "math.inc"
#include "transforms.inc"   
#include "ior.inc"

//#include "spectral.inc"

#declare phi = ( 1 + sqrt(5) ) / 2 ;
#declare zm = 1.0 ;
//------------------------------------------------------------------------
#declare Camera_1 = camera {/*ultra_wide_angle*/ angle 30   // diagonal view
                            location  <10.0 , 5.0 ,-10.0> * zm
                            right     x*image_width/image_height
                            look_at   <0.0 , 1 , 0.0> * zm }
camera{ Camera_1 }

// sky -------------------------------------------------------------------
sky_sphere{ pigment{ gradient <0,1,0>
                     color_map{ [0   color rgb<1,1,1>         ]//White
                                [0.4 color rgb<0.14,0.14,0.56>]//~Navy
                                [0.6 color rgb<0.14,0.14,0.56>]//~Navy
                                [1.0 color rgb<1,1,1>         ]//White
                              }
                     scale 2 }
           } // end of sky_sphere 

//------------------------------------------------------------------------
// sun -------------------------------------------------------------------

light_source{
    <10, 100, -1000>
    color rgb <1.0,1.0,1.0> * 0.25
    // photon block for a light source
  photons {
    reflection on
    refraction on
    //area_light
  }
}

// create point light sources
#declare lightPos = <0.0, 1.0, 0.0> ;
light_source { <0.0, 0.000000686719, 0.0>
    color rgb < 0.9, 0.05, 0.05 > * 0.2
    photons{ reflection on refraction on }
    translate lightPos
}

light_source { <0.0, 0.000000656281, 0.0>
    color rgb < 0.45, 0.45, 0.1 > * 0.2
    photons{ reflection on refraction on }
    translate lightPos
}

light_source { <0.0, 0.00000058929, 0.0> 
    color rgb < 0.05, 0.9, 0.05 > * 0.2   
    photons{ reflection on refraction on }
    translate lightPos
}

light_source { <0.0, 0.000000486134, 0.0>
    color rgb < 0.1, 0.45, 0.45 > * 0.2
    photons{ reflection on refraction on }
    translate lightPos
}

light_source { <0.0, 0.00000043078, 0.0> 
    color rgb < 0.05, 0.05, 0.9 > * 0.2 
    photons{ reflection on refraction on }
    translate lightPos
}

light_source { <0.0, 0.000000410175, 0.0>
    color rgb < 0.45, 0.1, 0.45 > * 0.2
    photons{ reflection on refraction on }
    translate lightPos
}

/*
light_source { <0.0, 0.00, 0.0>
  color rgb < 0.9, 0.9, 0.9 > * 0.1
  photons{ refraction on reflection on }
}
*/

plane { 
    <0,1,0>, 0 // normal vector, distance to zero ---- 
    //hollow 

    material {
        texture{ 
            pigment{ color rgb <0.50,0.50, 0.50> }
            normal { bumps 0.025 scale 0.00075 }
            finish { 
                specular 0.3 //roughness 0.0003 
                phong 1 phong_size 40 
                reflection{ 0.35 metallic 0.5 } 
            }
        } // end of texture
        
        interior{ 
            ior 1.2
            caustics 0.5 
            dispersion 1.1
            dispersion_samples 24
        }
    }

    scale < 1, 1, 1>
    rotate <0,0,0>
    translate <0.0,0.0,0.0>
    
    photons{ 
        target 0.98 
        reflection on 
        collect on
    }
    
} // end of plane ------------------------------------------

difference {
    cylinder { <0,0,0>,<0,phi,0>, 3.0*phi+0.01 open
        scale <1,1,1> rotate<0,0,0> translate<0,0,0> 
    } // end of cylinder -------------------------------------
    
    cylinder { <0,0,0>,<0,phi,0>, 3.0*phi open
        scale <1,1,1> rotate<0,0,0> translate<0,0,0> 
    } // end of cylinder -------------------------------------
    
    box { <-5.00, -5.00, -5.00>,< 5.00, 5.00, 0.00>       
        scale <1,1,1> rotate<0,0,0> translate<0,0,0> 
    } // end of box --------------------------------------

    material {
        texture{ Chrome_Metal
            normal { bumps 0.025 scale 0.00075 }
            finish { 
                specular 0.3 //roughness 0.0003 
                phong 1 phong_size 400 
                reflection{ 0.035 metallic 0.5 } 
            }
        } // end of texture ---------------------------  
    
        interior{ 
            ior 1.2
            caustics 0.5 
            dispersion 1.1
            dispersion_samples 24
        }
    }
    
    photons {
        target 0.98
        reflection on
        collect on
    }
}
       
#declare objIsoc = 
    union {
/*    
//      planes(l, L) (1, (1+sqrt(5))/2)

        triangle { <-phi, 0, -1>, <-phi, 0, 1>, <phi, 0, 1> pigment { rgb <1,0,0.5> } }
        triangle { <-phi, 0, -1>, <phi, 0, -1>, <phi, 0, 1> pigment { rgb <1,0.5,0> } }
        
        triangle { <0, -1, -phi>, <0, -1, phi>, <0, 1, phi> pigment { rgb <0.5,1,0> } }
        triangle { <0, -1, -phi>, <0, 1, -phi>, <0, 1, phi> pigment { rgb <0,1,0.5> } }
        
        triangle { <-1, -phi, 0>, <-1, phi, 0>, <1, phi, 0> pigment { rgb <0,0.5,1> } }
        triangle { <-1, -phi, 0>, <1, -phi, 0>, <1, phi, 0> pigment { rgb <0.5,0,1> } }
*/      
        triangle { <phi, 0, -1>, <0, 0, -phi>, <0, 1, -phi> }
        triangle { <phi, 0, -1>, <phi, 0, 0 >, <1, phi, 0 > }
        triangle { <1, phi, 0 >, <0, 1, -phi>, <0, phi, 0 > }
        triangle { <1, phi, 0 >, <0, 1, -phi>, <phi, 0, -1> }
        
        triangle { <-phi, 0, -1>,<-0, 0, -phi>,<-0, 1, -phi> }
        triangle { <-phi, 0, -1>,<-phi, 0, 0 >,<-1, phi, 0 > }
        triangle { <-1, phi, 0 >,<-0, 1, -phi>,<-0, phi, 0 > }
        triangle { <-1, phi, 0 >,<-0, 1, -phi>,<-phi, 0, -1> }
        
        triangle { <phi, 0, 1 >, <0, 0, phi>, <0, 1, phi > }
        triangle { <phi, 0, 1 >, <phi, 0, 0>, <1, phi, 0 > }
        triangle { <1, phi, 0 >, <0, 1, phi>, <0, phi, 0 > }
        triangle { <1, phi, 0 >, <0, 1, phi>, <phi, 0, 1 > }
        
        triangle { <-phi, 0, 1 >, <-0, 0, phi>, <-0, 1, phi > }
        triangle { <-phi, 0, 1 >, <-phi, 0, 0>, <-1, phi, 0 > }
        triangle { <-1, phi, 0 >, <-0, 1, phi>, <-0, phi, 0 > }
        triangle { <-1, phi, 0 >, <-0, 1, phi>, <-phi, 0, 1 > }
        
        triangle { <0, 0, 0 >, <phi, 0,  1>, <phi, 0, 0> }
        triangle { <0, 0, 0 >, <phi, 0, -1>, <phi, 0, 0> }
        
        triangle { <0, 0, 0 >, <-phi, 0,  1>, <-phi, 0, 0> }
        triangle { <0, 0, 0 >, <-phi, 0, -1>, <-phi, 0, 0> }
        
        triangle { <0, 0, 0 >, <0, 0, -phi>, <-phi, 0, -1> }
        triangle { <0, 0, 0 >, <0, 0, -phi>, <phi, 0, -1 > }
        
        triangle { <0, 0, 0 >, <0, 0, phi>, <-phi, 0, 1> }
        triangle { <0, 0, 0 >, <0, 0, phi>, <phi, 0, 1 > }
}

#declare matGlass = material {   //-----------------------------------------------------------
    texture { 
        pigment{ // rgbft f:filter t:transmit
            rgbf <0.98, 0.98, 0.98, 0.98>//, 0.25> 
        }
        
        finish { 
            diffuse 0.2 //brilliance 1.0 
            specular 0.8 // roughness 0.0003 
            phong 1 phong_size 1

//            reflection 0.0003 
            reflection 0.003 

        }
    } // end of texture -------------------------------------------
    
    interior{ 
        ior iorGlass 
        caustics 0.5
        dispersion 1.1
        dispersion_samples 24
    } // end of interior ------------------------------------------
} // end of material ----------------------------------------------------

object {
    objIsoc
    //hollow on
    material { matGlass }
    
    scale < 1, 1, 1>
    rotate <0,90,0>
    translate <0.0,0.0,0.0>   

    // photon block for an object
    photons{
        target 0.98          // spacing multiplier for photons hitting the object
        reflection on
        refraction on
        collect on       // off ignore photons
    //pass_through      // do not influence photons
    }      
}
