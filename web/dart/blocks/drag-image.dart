/*
 * NetTango
 * Copyright (c) 2017 Michael S. Horn, Uri Wilensky, and Corey Brady
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

class DragImage extends AvatarHandler {
  DivElement element;

  DragImage(DivElement drag) {
    element = drag;
  }

  @override
  void dragStart(Element draggable, Point startPosition) {
    avatar = element;
    // move the drag display "home" to calc the root offset
    setLeftTop(Point(0, 0));
    avatar.style.display = "block";
    final avatarOffset = getOffsetToRoot(avatar);
    final draggableOffset = getOffsetToRoot(draggable);
    setLeftTop(draggableOffset - avatarOffset);
  }

  static Point getOffsetTo(Element element, String className) {
    if (element.parent == null || element.parent.classes.contains(className)) {
      return element.offset.topLeft;
    } else {
      return element.offset.topLeft + getOffsetTo(element.parent, className);
    }
  }

  static Point getOffsetToRoot(Element element) {
    if (element.offsetParent == null) {
      return element.offset.topLeft;
    } else {
      return element.offset.topLeft + getOffsetToRoot(element.offsetParent);
    }
  }

  @override
  void drag(Point startPosition, Point position) {
    setTranslate(position - startPosition);
  }

  @override
  void dragEnd(Point startPosition, Point position) {
    element.classes.remove("nt-chain-starter");
    element.classes.remove("nt-chain-fragment");
    element.style.display = null;
  }

}