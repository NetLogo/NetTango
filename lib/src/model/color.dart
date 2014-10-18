/*
 * NetTango
 * Copyright (c) 2014 Michael S. Horn, Uri Wilensky, and Corey Brady
 * 
 * Northwestern University
 * 2120 Campus Drive
 * Evanston, IL 60613
 * http://tidal.northwestern.edu
 * http://ccl.northwestern.edu
 
 * This project was funded in part by the National Science Foundation.
 * Any opinions, findings and conclusions or recommendations expressed in this
 * material are those of the author(s) and do not necessarily reflect the views
 * of the National Science Foundation (NSF).
 */
part of NetTango;


class Color {
  
  int r = 255, g = 255, b = 255, a = 255;

   
  Color(this.r, this.g, this.b, this.a);
   
   
  Color clone() {
    return new Color(r, g, b, a);
  }
   
   
  void setColor(int r, int g, int b, int a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
   
   
  int get red => r;
      set red(int r) { if (r >= 0) { this.r = r < 256? r : 255; }}

   
  int get green => g;
      set green(int g) { if (g >= 0) { this.g = g < 256? g : 255; }}

      
  int get blue => b;
      set blue(int b) { if (b >= 0) { this.b = b < 256? b : 255; }}

      
  int get alpha => a;
      set alpha(int a) { if (a >= 0) { this.a = a < 256? a : 255; }}


/**
 * Converts to a CSS rgba string
 */
  String toString() {
    num ad = a / 255;
    return "rgba($r, $g, $b, $ad)";
  }
}
