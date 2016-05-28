/*
 * NetTango
 * Copyright (c) 2016 Michael S. Horn, Uri Wilensky, and Corey Brady
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


/**
 * Affine transform matrix
 */
class Matrix2D {
  
  List<double> xform = [ 1.0, 0.0, 0.0,
                         0.0, 1.0, 0.0,
                         0.0, 0.0, 1.0 ];

   
/**
 * Initializes as a 3x3 identity matrix
 */
  Matrix2D();
  
  
/**
 * Creates a copy of the given matrix
 */
  Matrix2D.copy(Matrix2D origin) {
    for (int i=0; i<9; i++) xform[i] = origin.xform[i];
  }
  
  
/**
 * Creates the inverse of the given matrix
 */
  Matrix2D invert() {
    Matrix2D i = new Matrix2D();
    List<double> m = xform;
    double det = determinant;
    if (det == 0.0) return i;
    double invDet = 1.0 / det;
    i.xform[0] = invDet * (m[4] * m[8] - m[7] * m[5]);
    i.xform[3] = invDet * (m[6] * m[5] - m[3] * m[8]);
    i.xform[6] = invDet * (m[3] * m[7] - m[6] * m[4]);
    i.xform[1] = invDet * (m[7] * m[2] - m[1] * m[8]);
    i.xform[4] = invDet * (m[0] * m[8] - m[6] * m[2]);
    i.xform[7] = invDet * (m[6] * m[1] - m[0] * m[7]);
    i.xform[2] = invDet * (m[1] * m[5] - m[4] * m[2]);
    i.xform[5] = invDet * (m[3] * m[2] - m[0] * m[5]);
    i.xform[8] = invDet * (m[0] * m[4] - m[3] * m[1]);
    return i;
  }
  
  
  double get determinant {
    double x = xform[0]*((xform[4]*xform[8])-(xform[7]*xform[5]));
    double y = xform[3]*((xform[1]*xform[8])-(xform[7]*xform[2]));
    double z = xform[6]*((xform[1]*xform[5])-(xform[4]*xform[2]));
    return x - y + z;
  }
  
  
  void setTransform(num m11, num m12, num m21, num m22, num dx, num dy) {
    xform[0] = m11;
    xform[1] = m21; //m12;
    xform[2] = dx;
    xform[3] = m12; //m21;
    xform[4] = m22;
    xform[5] = dy;
    xform[6] = 0.0;
    xform[7] = 0.0;
    xform[8] = 1.0;
  }


  void transformContact(Contact c) {
    double tx = c.touchX * xform[0] + c.touchY * xform[1] + xform[2];
    double ty = c.touchX * xform[3] + c.touchY * xform[4] + xform[5];
    c.touchX = tx;
    c.touchY = ty;
  }
  
  
  num transformTheta(num theta) {
    return theta + asin(xform[3]);
  }
  
  
  num transformX(num x, num y) {
    return x * xform[0] + y * xform[1] + xform[2];
  }
  
  
  num transformY(num x, num y) {
    return x * xform[3] + y * xform[4] + xform[5];
  }
  
  
  void transformContext(CanvasRenderingContext2D ctx) {
    ctx.transform(xform[0], xform[3], xform[1], xform[4], xform[2], xform[5]);
  }
}
