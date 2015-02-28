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


class TouchManager {
  
  /* Is the mouse currently down */
  bool mdown = false;
  
  /* Element that receives touch or mouse events */
  Element parent = null;
  
  /* A list of touch layers */
  List<TouchLayer> layers = new List<TouchLayer>();
   
  /* Bindings from event IDs to touchable objects */
  Map<int, TouchBinding> touch_bindings = new Map<int, TouchBinding>();
   
  
  TouchManager();
  
/*
 * Add a touch layer to the list
 */
  void addTouchLayer(TouchLayer layer) {
    layers.add(layer);
  }
   

/*
 * Remove a touch layer from the master list
 */
  void removeTouchLayer(TouchLayer layer) {
    layers.remove(layer);
  }
   
   
/*
 * See which layer wants to handle this touch
 */
  TouchBinding findTouchTarget(Contact tp) {
    for (int i=layers.length - 1; i >= 0; i--) {
      Touchable t = layers[i].findTouchTarget(tp);
      if (t != null) {
        layers[i].resetTouchTimer();
        return new TouchBinding(layers[i], t);
      } else {
        if (layers[i].backgroundTouch(tp)) {
          return null;
        }
      }
    }
    return null;
  }
  
  
/*
 * The main class must call this method to enable mouse and touch input
 */ 
  void registerEvents(Element element) {
    parent = element;
   
    element.onMouseDown.listen((e) => _mouseDown(e));
    element.onMouseUp.listen((e) => _mouseUp(e));
    element.onMouseMove.listen((e) => _mouseMove(e));

    element.onTouchStart.listen((e) => _touchDown(e));
    element.onTouchMove.listen((e) => _touchDrag(e));
    element.onTouchEnd.listen((e) => _touchUp(e));
      
    // Prevent screen from dragging on ipad
    document.onTouchMove.listen((e) => e.preventDefault());
  }

  
/*
 * Convert mouseUp to touchUp events
 */
  void _mouseUp(MouseEvent evt) {
    TouchBinding target = touch_bindings[-1];
    if (target != null) {
      Contact c = new Contact.fromMouse(evt);
      target.touchUp(c);
    }
    touch_bindings[-1] = null;
    mdown = false;
  }
  
   
/*
 * Convert mouseDown to touchDown events
 */
  void _mouseDown(MouseEvent evt) {
    Contact t = new Contact.fromMouse(evt);
    TouchBinding target = findTouchTarget(t);
    if (target != null) {
      if (target.touchDown(t)) {
        touch_bindings[-1] = target;
      }
    }
    mdown = true;
  }
   
   
/*
 * Convert mouseMove to touchDrag events
 */
  void _mouseMove(MouseEvent evt) {
    if (mdown) {
      Contact t = new Contact.fromMouse(evt);
      TouchBinding target = touch_bindings[-1];
      if (target != null) {
        target.touchDrag(t);
      } else {
        target = findTouchTarget(t);
        if (target != null) {
          target.touchSlide(t);
        }
      }
    }
  }
   
   
  void _touchDown(var tframe) {
    for (Touch touch in tframe.changedTouches) {
      Contact t = new Contact.fromTouch(touch, parent);
      TouchBinding target = findTouchTarget(t);
      if (target != null) {
        if (target.touchDown(t)) {
          touch_bindings[t.id] = target;
        }
      }
    }
  }
   
   
  void _touchUp(var tframe) {
    for (Touch touch in tframe.changedTouches) {
      Contact t = new Contact.fromTouch(touch, parent);
      TouchBinding target = touch_bindings[t.id];
      if (target != null) {
        target.touchUp(t);
        touch_bindings[t.id] = null;
      }
    }
    if (tframe.touches.length == 0) {
      touch_bindings.clear();
    }
  }
   
   
  void _touchDrag(var tframe) {
    for (Touch touch in tframe.changedTouches) {
      Contact t = new Contact.fromTouch(touch, parent);
      TouchBinding target = touch_bindings[t.id];
      if (target != null) {
        target.touchDrag(t);
      } else {
        target = findTouchTarget(t);
        if (target != null) {
          target.touchSlide(t);
        }
      }
    }
  }
}


class TouchLayer {

  /* A list of touchable objects on this layer */
  List<Touchable> touchables = new List<Touchable>();
   
  /* Bindings from event IDs to touchable objects */
  Map<int, Touchable> touch_bindings = new Map<int, Touchable>();
   
  /* Transformation matrices */
  Matrix2D xform = new Matrix2D();
  Matrix2D iform = new Matrix2D();

  /* Last touch event timestamp */
  DateTime last_touch;
  
  TouchLayer() {
    last_touch = new DateTime.now();   
  }

  
  void transform(num m11, num m12, num m21, num m22, num dx, num dy) {
    xform.setTransform(m11, m12, m21, m22, dx, dy);
    iform = xform.invert();
  }

   
/*
 * Add a touchable object to the list
 */
  void addTouchable(Touchable t) {
    touchables.add(t);
  }
   

/*
 * Remove a touchable object from the master list
 */
  void removeTouchable(Touchable t) {
    touchables.remove(t);
  }


/**
 * Classes can override this function to be notified of clicks/touches in the background
 * return true to prevent touch event from going to lower layers
 */
  bool backgroundTouch(Contact c) {
    return false;
  }  
   
   
/*
 * Find a touchable object that intersects with the given touch event
 */
  Touchable findTouchTarget(Contact tp) {
    Contact c = new Contact.copy(tp);
    iform.transformContact(c);
    for (int i=touchables.length - 1; i >= 0; i--) {
      if (touchables[i].containsTouch(c)) {
        return touchables[i];
      }
    }
    return null;
  }
  
  
/*
 * Reset the touch timer so that it's easy to see when a layer was last touched
 */
  void resetTouchTimer() {
    last_touch = new DateTime.now();    
  }
  
  
/*
 * Returns the time in seconds since the last touch event for this layer
 */
  int getTimeSinceLastTouchEvent() {
    return (new DateTime.now().difference(last_touch)).inSeconds;
  }
  
  
  void transformContact(Contact c) {
    iform.transformContact(c);
  }
  
  
  num objectToWorldX(num x, num y) {
    return xform.transformX(x, y);
  }
  
  
  num objectToWorldY(num x, num y) {
    return xform.transformY(x, y);
  }
  
  
  num objectToWorldTheta(num theta) {
    return xform.transformTheta(theta);
  }
  
  
  num worldToObjectX(num x, num y) {
    return iform.transformX(x, y);
  }
  
  
  num worldToObjectY(num x, num y) {
    return iform.transformY(x, y);
  }
}


/*
 * Internal object used to keep track of mappings from touch ID numbers to
 * touchable objects.
 */
class TouchBinding {
  
  TouchLayer layer;
  Touchable touchable;
  
  TouchBinding(this.layer, this.touchable);
  
  
  bool touchDown(Contact c) {
    layer.transformContact(c);
    return touchable.touchDown(c);
  }
  
  void touchUp(Contact c) {
    layer.transformContact(c);
    touchable.touchUp(c);
  }
  
  void touchDrag(Contact c) {
    layer.transformContact(c);
    touchable.touchDrag(c);
  }
  
  void touchSlide(Contact c) {
    layer.transformContact(c);
    touchable.touchSlide(c);
  }
}


/*
 * Objects on the screen must implement this interface to receive touch events
 */
abstract class Touchable {
  
  bool containsTouch(Contact event);
   
  // This gets fired if a touch down lands on the touchable object. 
  // Return true to 'own' the touch event for the duration 
  // Return false to ignore the event (e.g. if disabled or if you want slide events)
  bool touchDown(Contact event);
   
  void touchUp(Contact event);
   
  // This gets fired only after a touchDown lands on the touchable object
  void touchDrag(Contact event);
   
  // This gets fired when an unbound touch events slides over an object
  void touchSlide(Contact event);
}


class Contact {
  int id;
  int tagId = -1;
  num touchX = 0;
  num touchY = 0;
  bool tag = false;
  bool up = false;
  bool down = false;
  bool drag = false;
  bool finger = false;
  
  Contact(this.id);
  
  Contact.fromMouse(MouseEvent mouse) {
    id = -1;
    touchX = mouse.offset.x.toDouble();
    touchY = mouse.offset.y.toDouble();
    finger = true;
  }

  
  Contact.fromTouch(Touch touch, Element parent) {
    num left = window.pageXOffset;
    num top = window.pageYOffset;
    
    if (parent != null) {
      Rectangle box = parent.getBoundingClientRect();
      left += box.left;
      top += box.top;
    }
    
    id = touch.identifier;
    touchX = touch.page.x.toDouble() - left;
    touchY = touch.page.y.toDouble() - top;
    finger = true;
  }
  
  
  Contact.copy(Contact c) {
    id = c.id;
    tagId = c.tagId;
    touchX = c.touchX;
    touchY = c.touchY;
    up = c.up;
    down = c.down;
    drag = c.drag;
    finger = c.finger;
  }
}
