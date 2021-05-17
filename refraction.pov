// PoVRay 3.7 Scene File " ... .pov"
// author:  ...
// date:    ...
// -----------------------------------------------------------
#version 3.7;
// adding a photon{} block to global_settings activates photon mapping.
// photons also need to be adjusted for light sources and objects.

global_settings {
  assumed_gamma 1.80
  photons {
    spacing 0.001                 // specify the density of photons
    //count 10000000               // alternatively use a total number of photons

    gather 20, 100            // amount of photons gathered during render [20, 100]
    //media max_steps [,factor]  // media photons
    //jitter 1.0                 // jitter phor photon rays
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

//#include "spectral.inc"

#declare zm = 1.0 ;

//------------------------------------------------------------------------
#declare Camera_0 = camera {/*ultra_wide_angle*/ angle 15      // front view
                            location  <0.0 , 1.0 ,-40.0>
                            right     x*image_width/image_height
                            look_at   <0.0 , 1.0 , 0.0>}
#declare Camera_1 = camera {/*ultra_wide_angle*/ angle 30   // diagonal view
                            location  <10.0 , 5.0 ,-10.0> * zm
                            right     x*image_width/image_height
                            look_at   <0.0 , 1 , 0.0> * zm }
#declare Camera_2 = camera {/*ultra_wide_angle*/ angle 90  //right side view
                            location  <3.0 , 1.0 , 0.0>
                            right     x*image_width/image_height
                            look_at   <0.0 , 1.0 , 0.0>}
#declare Camera_3 = camera {/*ultra_wide_angle*/ angle 90        // top view
                            location  <0.0 , 3.0 ,-0.001>
                            right     x*image_width/image_height
                            look_at   <0.0 , 1.0 , 0.0>}
camera{Camera_1}

//------------------------------------------------------------------------
// sun -------------------------------------------------------------------

light_source{
    <10, 100, -1000>
    color White
    //SpectralEmission(E_Sunlight) * 1.8
    
    // photon block for a light source
  photons {
    refraction on
    reflection on
    //area_light
  }
}

// sky -------------------------------------------------------------------
sky_sphere{ pigment{ gradient <0,1,0>
                     color_map{ [0   color rgb<1,1,1>         ]//White
                                [0.4 color rgb<0.14,0.14,0.56>]//~Navy
                                [0.6 color rgb<0.14,0.14,0.56>]//~Navy
                                [1.0 color rgb<1,1,1>         ]//White
                              }
                     scale 2 }
           } // end of sky_sphere 

// create a regular point light source

light_source {
//  <-0.003, 0.005, 0.0>                  // light's position (translated below)
  <0.0, 0.005, 0.0>                  // light's position (translated below)
  color rgb <0.8,0.1,0.1> * 1.0   // light's color
  // photon block for an object
  photons{
    refraction on
    reflection on
  }
}

light_source {
//  <0.003, 0.005, -0.003>                  // light's position (translated below)
  <0.0, 0.005, 0.0>                  // light's position (translated below)
  color rgb <0.1,0.8,0.1> * 0.70   // light's color
  // photon block for an object
  photons{
    refraction on
    reflection on
  }
}

light_source {
//  <0.003, 0.005, 0.0>                  // light's position (translated below)
  <0.0, 0.005, 0.0>                  // light's position (translated below)
  color rgb <0.1,0.1,0.8> * 0.64   // light's color
  // photon block for an object
  photons{
    refraction on
    reflection on
  }
}


plane { <0,1,0>, 0  hollow // normal vector, distance to zero ----

        texture{ pigment{ color rgb<0.50,0.50, 0.50> }
	         normal { bumps 0.25 scale 0.05 }
             finish { specular 0.03 }
             } // end of texture
        scale < 1, 1, 1>
        rotate< 0,0,0> rotate<0,0,0>
        translate<0.0,0.0,0.0>
      } // end of plane ------------------------------------------


// CSG difference, subtract intersections of shapes 2...N from Shape1
//---------------------- demi cylindre -----------------------------------------------------
difference {
  //Shape1 {...} // Start with this shape

    #declare F1= function(u,v){cos(u)} 
    #declare F2= function(u,v){sin(u)} 
    #declare F3= function(u,v){v}
    //---------------------------------------------------------------------------------------------------
    #include "meshmaker.inc"
    //---------------------------------------------------------------------------------------------------
    object{ //-------------------------------------------------------------------------------------------
       Parametric( //(Fx,Fy, Fz, <UVmin>, <UVmax>, Iter_U, Iter_V, FileName)
                   // Builds a parametric surface out of three given functions. 
                   // The uv_coordinates for texturing the surface come from the square <0,0> - <1,1>. 
          F1, F2, F3, //three functions from which the object will be generated. 
            // Following 2 vectors are the range within which the surface is calculated: 
          <   0, -1>, // 2-D vector that gives the lower boundaries of the uv-rectangle, <u min, v min>. 
          <2*pi,  1>, // 2-D vector that gives the upper boundaries of the uv-rectangle. 
          48, // 
          6, //
           ""  // FileName: ""= non, "NAME.obj'= Wavefront objectfile, "NAME.pcm" compressed mesh file 
               // "NAME.arr" = include file with arrays to build a mesh2 from, 
               //  others: includefile with a mesh2 object 
       ) //----------------------------------------------------------------------------------------------
    
       rotate <90,0,0>
       scale<3.0,1.0,3.0>
       //translate< 0,1,0>
    } // end of object 
    //---------------------------------------------------------------------------------------------------

  //ShapeN {...} // This will be "cut out" of Shape1
    box { <-4.00, -4.00, -4.00>,< 0.00, 4.00, 4.00>   
    
          scale <1,1,1> rotate<0,0,0> translate<0,0,0> 
        } // end of box --------------------------------------

    translate<0,-0.0,0> rotate<0,-120,0>

   texture{           //  outside texture
     uv_mapping
     pigment{color rgb<0.80,0.80,0.80> }
     //pigment {checker color rgb <0.0,0.2,0.5> rgb <1,1,1> scale <0.02,0.05,1>}
     finish{specular 0.5}
   } // 
   interior_texture{   // inside texture
     uv_mapping
     pigment{color rgb<0.75,0.7,1> }
     normal { crackle 1.75 scale 0.025 turbulence 0.2 }
     //pigment {checker color rgb <0.0,0,0.0> rgb <1,0.7,0.7> scale <0.02,0.05,1>}
     finish{specular 0.5}
   } // 
    photons{
        target 1.0          // spacing multiplier for photons hitting the object
        refraction on
        reflection on
        //collect off       // ignore photons
        //pass_through      // do not influence photons
    }

}

       
// CSG difference, subtract intersections of shapes 2...N from Shape1
//-----------------------obj semi transparent-----------------------------------------------------------------
difference {
  //Shape1 {...} // Start with this shape
    object{ Dodecahedron  
            scale <1,1,1>
/*
            texture { pigment{ color rgb<1,0.67,0.15> }
                      normal { crackle 1.75 scale 0.25 turbulence 0.2 }
                      finish { phong 0.3 reflection{ 0.35 metallic 0.5 } }
                    }
*/
            scale <1,1,1>*1 
            rotate<0,36,0> rotate<36,0,0> 
            translate<0,0.0,0> 
           } // end of object 

  //Shape2 {...} // This will be "cut out" of Shape1
    object{ Dodecahedron  
            scale <1,1,1>
/*
            texture { pigment{ color rgb<1,0.67,0.15> }
                      normal { crackle 1.75 scale 0.25 turbulence 0.2 }
                      finish { phong 0.3 reflection{ 0.35 metallic 0.5 } }
                    }
*/
            scale <1,1,1>/1.618 
            rotate<0,36,0> rotate<36,0,0> rotate<0,0,90>
            translate<0,0.0,0> 
           } // end of object

  //ShapeN {...} // This will be "cut out" of Shape1
    box { <-2.00, 0.00, -2.00>,< 2.00, -2.00, 2.00>   
    
          scale <1,1,1> rotate<0,0,0> translate<0,0,0> 
        } // end of box --------------------------------------

    translate<0,-0.0,0> rotate<0,0,0>

    
    material{   //-----------------------------------------------------------
        texture { pigment{ rgbf <0.98, 0.98, 0.98, 0.9> }
                  finish { diffuse 0.1 reflection 0.2  
                          specular 0.8 roughness 0.0003 phong 1 phong_size 400}
                } // end of texture -------------------------------------------
        
        interior{ 
            ior 1.5 
            caustics 0.5
            } // end of interior ------------------------------------------
      } // end of material ----------------------------------------------------

  //material { M_Glass }
  //M_Spectral_Filter (Value_1, IOR_CrownGlass_K7, 100)

    // photon block for an object
  photons{
    target 1.0          // spacing multiplier for photons hitting the object
    refraction on
    reflection on
    collect on       // ignore photons
    //pass_through      // do not influence photons
  }
      
}
