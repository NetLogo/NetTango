/*
 * Frog Pond Evolution
 * Copyright (c) 2015 Michael S. Horn
 * 
 *           Michael S. Horn (michael-horn@northwestern.edu)
 *           Northwestern University
 *           2120 Campus Drive
 *           Evanston, IL 60613
 *           http://tidal.northwestern.edu
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation.
 * 
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 */
part of FrogPond2;


class Frog extends Turtle {
  
  /* pond that contains this frog */
  FrogPond pond;
  
  /* size of the sound wave emanating from the frog */
  double _sound = -1.0;
  
  /* length of the tongue coming out of the frog */
  double _tongue = 0.0;
  
  /* extent of vision cone */
  double _vision = -1.0;
  
  /* name of the command being executed */
  String label = null;
  
  /* beetle captured by frog for eating */
  Fly prey = null;
  
  /* how long until we starve? */
  int energy = 1500;

  /* age of frog in ticks */
  int age = 0;

  /* this frog was just hatched so don't run it's program yet */
  bool tadpole = false;
  
  /* Image for drawing */
  ImageElement img = new ImageElement();
  
  
  
  Frog(FrogPond pond) : super(pond) {
    this.pond = pond;
    img.src = "images/bluefrog.png";
  }
  
  
  Turtle hatch() {
    Frog clone = new Frog(pond);
    copyTo(clone);
    clone.program.restart();
    clone.tadpole = true;
//  clone.program.synchronize(program);
    pond.frogs.add(clone);
    energy ~/= 2; // reproduction cost
    clone.energy = energy;
    clone.age = 0;
    return clone;
  }
  
  double get tongueX => x - sin(heading) * _tongue * size * 1.8;
  
  double get tongueY => y + cos(heading) * _tongue * size * 1.8;
  
  double get radius => super.radius * 0.75;
  
  
  void reset() {
    opacity = 1.0;
    _sound = -1.0;
    _tongue = 0.0;
    _vision = -1.0;
    label = null;
  }
  
  
  void tick() {
    if (tadpole) return;
    energy--;
    age++;
    super.tick();
  }
  

/**
 * Called at the end of every action to pause the frog for a moment
 */
  void doPause() {
    // is the frog in the water? 
    if (inWater()) {
      Sounds.playSound("splash");
      die();
    } else {
      tween = new Tween();
      tween.delay = 0;
      tween.duration = 20;
      tween.onstart = (() { });
      tween.onend = (() { reset(); });
    }
  }
  
  
/**
 * Hop forward
 */
  void doHop(var param) {
    double length = size;
    if (param is num) length *= param;
    tween = new Tween();
    tween.function = TWEEN_SINE2;
    tween.delay = 0;
    tween.duration = 12;
    tween.onstart = (() { Sounds.playSound("hop"); label = "hop"; });
    tween.onend = (() { doPause(); });
    tween.addControlPoint(0, 0);
    tween.addControlPoint(length, 1);
    tween.ondelta = ((value) {
      forward(value);
    });
  }
  
  
/**
 * Turn the frog left or right
 */
  void doTurn(String cmd, var param) {
    num angle = 60;
    if (param == 'random') {
      angle = Agent.rnd.nextInt(90);
      if (cmd == 'right') angle *= -1.0;
    } else if (param is num) {
      angle = param;
      if (cmd == 'right') angle *= -1.0;
    } else if (cmd == 'right') {
      angle = Agent.rnd.nextInt(90) * -1.0;
    } else if (cmd == 'left') {
      angle = Agent.rnd.nextInt(90);
    } else {
      angle = Agent.rnd.nextInt(180).toDouble() - 90.0;
    }
    String s = "$cmd";
    if (param != null) s = "$cmd $param";
    tween = new Tween();
    tween.function = TWEEN_SINE2;
    tween.delay = 0;
    tween.duration = 20;
    tween.onstart = (() => label = s);
    tween.addControlPoint(0, 0);
    tween.addControlPoint(angle, 1);
    tween.ondelta = ((value) => left(value));
    tween.onend = (() { doPause(); });
  }
  

/**
 * Spin randomly
 */
  void doSpin() {
    num angle = Agent.rnd.nextInt(360 * 3);
    if (Agent.rnd.nextBool()) angle *= -1;
    String s = "spin";
    tween = new Tween();
    tween.function = TWEEN_SINE2;
    tween.delay = 0;
    tween.duration = 30;
    tween.onstart = (() => label = s);
    tween.addControlPoint(0, 0);
    tween.addControlPoint(angle, 1);
    tween.ondelta = ((value) => left(value));
    tween.onend = (() { doPause(); });
  }
  

/**
 * Make the frog chirp
 */
  void doChirp() {
    tween = new Tween();
    tween.function = TWEEN_LINEAR;
    tween.onstart = (() {
      Sounds.playSound("chirp");
      label = "chirp";
      _sound = 0.0;
    });
    tween.onend = (() {
      _sound = -1.0;
      doPause();
    });
    tween.addControlPoint(0, 0);
    tween.addControlPoint(size * 1.75, 1);
    tween.duration = 25;
    tween.delay = 0;
    tween.ondelta = ((value) => _sound += value);
  }
    
  
/**
 * Make the frog stick out its tongue
 */
  void doEat() {
    tween = new Tween();
    tween.function = TWEEN_SINE2;
    tween.onstart = (() {
      label = "hunt";
      _tongue = 0.0;
    });
    tween.addControlPoint(0.0, 0.0);
    tween.addControlPoint(1.0, 0.4);
    tween.addControlPoint(0.0, 1.0);
    tween.duration = 20;
    tween.ondelta = ((value) {
      _tongue += value;
      eatBug();
      if (_tongue == 1.0) Sounds.playSound("swoosh");
    });
    tween.onend = (() {
      if (prey != null) {
        Sounds.playSound("gulp");
        prey.die();
        prey = null;
      }
      doPause();
    });
  }

  
/**
 * Hunts for food
 */
  void doHunt() {
    tween = new Tween();
    tween.onstart = (() {
      label = "hunt";
      _vision = 10.0;
    });
    tween.onend = (() {
      doPause();
    });
    tween.addControlPoint(0.0, 0.0);
    tween.addControlPoint(0.0, 1.0);
    tween.duration = 140;
    tween.ondelta = ((value) {
      if (seeFly()) {
        _vision = 0.0;
        doEat();
      }
    });
  }
  
  
/**
 * Kill this frog
 */
  void doDie(var param) {
    if (param == null ||
        (param == "old" && isOld()) ||
        (param == "starving" && isStarving()) ||
        (param == "old or starving" && (isOld() || isStarving())) ||
        (param == "always")) {
      tween = new Tween();
      tween.function = TWEEN_DECAY;
      tween.delay = 0;
      tween.duration = 8;
      tween.repeat = 3;
      tween.addControlPoint(1.0, 0);
      tween.addControlPoint(0.0, 0.5);
      tween.addControlPoint(1.0, 1.0);
      tween.ondelta = ((value) => opacity += value );
      tween.onend = (() { die(); });
    }
  }
  

/**
 * Hatch a new frog
 */
  void doHatch(var param) {
    Frog baby = hatch();
    if (baby == null) return;
    baby.size = 0.05;
    baby.heading = heading;
    baby.left(Agent.rnd.nextInt(360).toDouble());
    baby.tadpole = true;
    tween = new Tween();
    tween.function = TWEEN_DECAY;
    tween.delay = 0;
    tween.duration = 15;
    tween.onstart = (() => label = "hatch");
    tween.onend = (() {
      doPause();
      //if (running) baby.program.play();
    });
    
    // compute new size for frog depending on parameter
    double s = size;
    if (param == "size-variation") {
      s += Agent.rnd.nextDouble() * 0.2 - 0.1;
    }
    s = min(MAX_FROG_SIZE, max(MIN_FROG_SIZE, s));
    tween.addControlPoint(0.05, 0);
    tween.addControlPoint(s, 1.0);
    tween.ondelta = ((value) => baby.size += value);
    tween.onend = (() => baby.tadpole = false);
  }

    
  bool nearWater() {
    bool wet = false;
    double r = size * 1.5;
    forward(r);
    if (inWater()) wet = true;
    backward(r);
    return wet;
  }
  
  
  bool inWater() {
    return pond.inWater(x, y);
  }
  
  
  bool isStarving() {
    return energy <= 0;
  }


  num get energyPercent {
    return max(energy, 0) / 15;
  }


  String get energyAsString {
    return "${energyPercent.toStringAsFixed(1)}%";
  }
  
  
  bool isHungry() {
    return energy <= 400;
  }


  bool isOld() {
    return age > 500;
  }
  
  
  bool isFull() {
    return energy >= 1000;
  }
  
  // FIX ME
  bool seeBug() {
    //forward(radius * 4.0);
    //Fly bug = pond.bugs.getTurtleHere(this);
    //bool b = bug != null;
    //backward(radius * 4.0);
    //return b;
    return false;
  }
  

  bool seeFly() {
    for (Fly fly in pond.bugs) {
      if (!fly.dead && !fly.captured) {
        num d = distance(fly.x, fly.y, x, y);
        if (d > size * 0.1 && d < size * 1.6) {
          if (angleBetween(fly).abs() <= 10.0) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  
/*  
  bool isBlocked() {
    forward(radius * 4.0);
    bool blocked = pond.isFrogHere(this);
    backward(radius * 4.0);
    return blocked;
  }
*/  
  
  void eatBug() {
    if (prey == null) {
      Fly bug = pond.bugs.getTurtleAtPoint(tongueX, tongueY, Fly);
      if (bug != null && !bug.dead && !bug.captured) {
        prey = bug;
        prey.captured = true;
        energy = 1500;
      }
    } else {
      prey.x = tongueX;
      prey.y = tongueY;
    }
  }
  
  void draw(CanvasRenderingContext2D ctx) {
    
    //---------------------------------------------
    // draw sound wave
    //---------------------------------------------
    if (_sound > 0) {
      num alpha = 1 - (_sound / (1.75 * size));
      ctx.strokeStyle = "rgba(255, 255, 255, $alpha)";
      ctx.lineWidth = 0.05;
      ctx.beginPath();
      ctx.arc(0, 0, _sound, 0, PI * 2, true);
      ctx.stroke();
    }

    //---------------------------------------------
    // draw vision cone
    //---------------------------------------------
    if (_vision > 0) {
      double theta = _vision / 180.0 * PI;
      double r = size * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, PI * 0.5 - theta, PI * 0.5 + theta, false);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fill();
    }
    
    //---------------------------------------------
    // draw tongue sticking out
    //---------------------------------------------
    if (_tongue > 0) {
      ctx.beginPath();
      roundRect(ctx, size * -0.04, 0, size * 0.08, _tongue * size * 1.5, size * 0.05);
      ctx.fillStyle = '#922';
      ctx.fill();
    }
    
    //---------------------------------------------
    // draw frog image
    //---------------------------------------------
    num iw = size;
    num ih = size;
    ctx.drawImageScaled(img, -iw/2, -ih/2, iw, ih);
  }
}