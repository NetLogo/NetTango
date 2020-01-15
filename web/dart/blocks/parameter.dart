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

/// Represents a block's parameter value
class Parameter {

  /// parameter id - unique per block
  int id;

  /// parent block
  Block block;

  /// current parameter value
  var _value;

  /// default / initial value (can be null)
  var defaultValue;

  /// parameter type: can be "bool", "num", "int", "range", "text", or "selection"
  String type = "int";

  /// name of the parameter (e.g. degrees, length)
  String name = "";

  /// short unit name that will be displayed after the value (e.g. %, px, m, mm, s)
  String unit = "";

  /// subclasses override this property definition
  dynamic get value => toStr(_value, "");

  set value(var v) => _value = toStr(v, "");

  String get valueAsString => "${_value.toString()}$unit";

  Parameter(this.block, Map data) {
    if (data.containsKey("id")) {
      id = data["id"];
      if (id >= this.block.nextParamId) {
        this.block.nextParamId = id + 1;
      }
    } else {
      id = this.block.nextParamId++;
    };
    data["id"] = id;

    type = toStr(data["type"], "num");
    name = toStr(data["name"], "");
    unit = toStr(data["unit"], "");
    defaultValue = data["default"];
    value = defaultValue;
  }

  Parameter clone(Block parent) {
    return new Parameter.fromJSON(parent, toJSON());
  }

  Map toJSON() {
    return {
      "id" : id,
      "type" : type,
      "name" : name,
      "unit" : unit,
      "value" : value,
      "default" : defaultValue
    };
  }

  factory Parameter.fromJSON(Block parent, Map data) {
    switch(toStr(data["type"], "num")) {
      case "int": return new IntParameter(parent, data);

      case "num": return new ExpressionParameter(parent, data);

      case "bool": return new ExpressionParameter(parent, data);

      case "range": return new RangeParameter(parent, data);

      case "select": return new SelectParameter(parent, data);

      case "text": return new Parameter(parent, data);

      default: return new Parameter(parent, data);
    }
  }

  // parameters are meant to display inline with just a value
  DivElement drawParameter() {
    DivElement paramDiv = new DivElement();
    paramDiv.innerText = valueAsString;
    paramDiv.classes.add("nt-attribute-value");

    paramDiv.style.color = this.block.blockColor;

    final updateValue = () { paramDiv.innerText = valueAsString; };
    paramDiv.onClick.listen( (event) {
      final rect = block.workspace.container.getBoundingClientRect();
      _showParameterDialog(event.page.x - rect.left.floor(), event.page.y - rect.top.floor(), updateValue);
    });
    return paramDiv;
  }

  // properties display stand-alone with an identifier
  DivElement drawProperty() {
    DivElement propDiv = new DivElement();
    propDiv.classes.add("nt-property");
    DivElement propName = new DivElement();
    propName.classes.add("nt-property-name");
    propName.innerText = "\u25B8 $name";
    propDiv.append(propName);
    propDiv.append(drawParameter());
    return propDiv;
  }

  void _showParameterDialog(int x, int y, Function acceptCallback) {
    DivElement backdrop = new DivElement() .. className = "backdrop";
    String inputCode = _buildHTMLInput();
    backdrop.appendHtml("""
      <div class="nt-param-dialog" style="top: ${y};">
        <div class="nt-param-table">
          <div class="nt-param-row">${inputCode}</div>
        </div>
        <button class="nt-param-confirm">OK</button>
        <button class="nt-param-cancel">Cancel</button>
      </div>""");
    HtmlElement container = querySelector("#${block.workspace.containerId}").parent;
    if (container == null) return;
    container.append(backdrop);

    HtmlElement label = querySelector("#nt-param-label-$id");
    InputElement input = querySelector("#nt-param-$id");

    querySelectorAll(".nt-param-confirm").onClick.listen((e) {
      if (input != null) {
        value = input.value;
      }
      backdrop.remove();
      acceptCallback();
      block.workspace.programChanged(new AttributeChangedEvent(this.block.id, this.block.instanceId, this.id, this.value));
    });

    querySelectorAll(".nt-param-cancel").onClick.listen((e) => backdrop.remove());

    backdrop.classes.add("show");

    if (input != null) {
      input.focus();
      if (label != null) {
        input.onChange.listen((e) { label.innerHtml = input.value; });
        input.onInput.listen((e) { label.innerHtml = input.value; });
      }
    }
  }

  String _buildHTMLInput() {
    return """
      <input class="nt-param-input" id="nt-param-${id}" type="text" value="${valueAsString}">
      <span class="nt-param-unit">${unit}</span>
    """;
  }
}

//-------------------------------------------------------------------------
/// Represents a number parameter
//-------------------------------------------------------------------------
class NumParameter extends Parameter {

  /// represents a random number?
  bool random = false;

  /// step interval for selections (for numbers and range)
  num stepSize = 1;

  NumParameter(Block block, Map data) : super(block, data) {
    random = toBool(data["random"], false);
    stepSize = toNum(data["step"], stepSize);
  }

  Map toJSON() {
    Map json = super.toJSON();
    json["random"] = random;
    json["step"] = stepSize;
    return json;
  }

  dynamic get value => toNum(_value, 0.0);
  set value(var v) => _value = toNum(v, 0.0);

  String get valueAsString {
    String s = (value as num).toStringAsFixed(1);
    s = (s.endsWith('.0')) ? s.substring(0, s.length - 2) : s;
    return "$s$unit";
  }

  String _buildHTMLInput() {
    return """
      <div class="nt-param-name">${name}</div>
      <div class="nt-param-value">
        <input class="nt-param-input" id="nt-param-${id}" type="number" step="${stepSize}" value="${value}">
        <span class="nt-param-unit">${unit}</span>
      </div>
    """;
  }
}


//-------------------------------------------------------------------------
/// Represents an integer parameter
//-------------------------------------------------------------------------
class IntParameter extends NumParameter {

  IntParameter(Block block, Map data) : super(block, data) { stepSize = 1; }

  dynamic get value => toInt(_value, 0);
  set value(var v) => _value = toInt(v, 0);
}


//-------------------------------------------------------------------------
/// Represents a range of numbers
//-------------------------------------------------------------------------
class RangeParameter extends NumParameter {

  /// lowest possible value that the user can select (for numbers and range)
  num minValue = 0;

  /// highest possible value that the user can select (for numbers and range)
  num maxValue = 10;


  RangeParameter(Block block, Map data) : super(block, data) {
    minValue = toNum(data["min"], minValue);
    maxValue = toNum(data["max"], maxValue);
  }

  Map toJSON() {
    Map json = super.toJSON();
    json["min"] = minValue;
    json["max"] = maxValue;
    return json;
  }

  void _showParameterDialog(int x, int y, Function acceptCallback) {
    DivElement backdrop = new DivElement() .. className = "backdrop";
    DivElement dialog = new DivElement() .. className = "nt-param-dialog";
    dialog.style.top = "${y}px";
    DivElement table = new DivElement() .. className = "nt-param-table";

    table.appendHtml(
      """
        <div class="nt-param-row">
          <div class="nt-param-label">
            ${name}:
            <label id="nt-param-label-${id}" for="nt-param-${id}">${value}</label>
            <span class="nt-param-unit">${unit}</span>
          </div>
        </div>
        <div class="nt-param-row">
          <div class="nt-param-value">
            <input class="nt-param-input" id="nt-param-${id}" type="range" value="${value}" min="$minValue" max="$maxValue" step="$stepSize">
          </div>
        </div>
      """);

    dialog.append(table);
    dialog.onClick.listen((e) { e.stopPropagation(); });
    backdrop.append(dialog);
    backdrop.onClick.listen((e) { backdrop.remove(); });
    HtmlElement container = querySelector("#${block.workspace.containerId}").parent;
    if (container != null) container.append(backdrop);

    HtmlElement label = querySelector("#nt-param-label-$id");
    InputElement input = querySelector("#nt-param-$id");
    if (input != null && label != null) {
      input.onChange.listen((e) {
        value = input.value;
        backdrop.remove();
        acceptCallback();
        block.workspace.programChanged(new AttributeChangedEvent(this.block.id, this.block.instanceId, this.id, this.value));
        e.stopPropagation();
      });
      input.onInput.listen((e) { label.innerHtml = input.value; });
    }

    backdrop.classes.add("show");
  }
}

//-------------------------------------------------------------------------
/// Represents a value selected from a list of options
//-------------------------------------------------------------------------
class SelectParameter extends Parameter {

  /// list of possible values for select type
  var values = [ ];
  var _display;

  String get valueAsString => "${_display.toString()}$unit \u25BE";

  SelectParameter(Block block, Map data) : super(block, data) {
    if (data["values"] is List && data["values"].length > 0) {
      values = data["values"];
      _display = _chooseDisplayValue(values[0]);
      _value = values[0]["actual"];
    }
  }

  Parameter clone(Block parent) {
    return new SelectParameter(parent, toJSON());
  }

  Map toJSON() {
    Map json = super.toJSON();
    json["values"] = values;
    return json;
  }

  dynamic _chooseDisplayValue(dynamic v) {
    return v.containsKey("display") && v["display"] != "" ? v["display"] : v["actual"];
  }

  void _showParameterDialog(int x, int y, Function acceptCallback) {
    DivElement backdrop = new DivElement() .. className = "backdrop";
    DivElement dialog = new DivElement() .. className = "nt-param-dialog small";
    dialog.style.top = "${y}px";
    DivElement table = new DivElement() .. className = "nt-param-table";

    for (var v in values) {
      DivElement row = new DivElement() .. className = "nt-param-row";
      final display = _chooseDisplayValue(v);
      DivElement opt = new DivElement() .. className = "nt-select-option" .. innerHtml = display;
      if (v["actual"] == value) { opt.classes.add("selected"); }
      opt.onClick.listen((e) {
        _display = _chooseDisplayValue(v);
        value = v["actual"];
        backdrop.remove();
        acceptCallback();
        block.workspace.programChanged(new AttributeChangedEvent(this.block.id, this.block.instanceId, this.id, this.value));
        e.stopPropagation();
      });
      row.append(opt);
      table.append(row);
    }

    dialog.append(table);
    backdrop.append(dialog);
    backdrop.onClick.listen((e) { backdrop.remove(); });

    HtmlElement container = querySelector("#${block.workspace.containerId}").parent;
    if (container != null) container.append(backdrop);

    backdrop.classes.add("show");
  }
}


//-------------------------------------------------------------------------
/// Represents an expression (boolean or number)
//-------------------------------------------------------------------------
class ExpressionParameter extends Parameter {

  ExpressionBuilder builder;

  String get valueAsString => (builder != null) ? builder.toString() : "";

  dynamic get value => _value;

  set value(var v) {
    _value = v;
    if (builder != null) builder.fromJSON(v);
  }

  ExpressionParameter(Block block, Map data) : super(block, data) {
    builder = new ExpressionBuilder(block.workspace, data['type']);
    builder.fromJSON(value);
  }

  Map toJSON() {
    Map json = super.toJSON();
    if (json["value"] is Map) {
      json["expressionValue"] = CodeFormatter.formatExpression(json["value"]);
    }
    return json;
  }

  Parameter clone(Block parent) {
    return new ExpressionParameter(parent, toJSON());
  }

  void _showParameterDialog(int x, int y, Function acceptCallback) {
    DivElement backdrop = new DivElement() .. className = "backdrop";
    backdrop.appendHtml("""
      <div class="nt-param-dialog" style="top: ${y};">
        <div class="nt-param-table">
          <div class="nt-param-row">
            <div class="nt-param-label">${name}:</div>
          </div>
          <div class="nt-param-row">
            <div id="nt-expression-${id}" class="nt-expression-root"></div>
          </div>
        </div>
        <button class="nt-param-confirm">OK</button>
        <button class="nt-param-cancel">Cancel</button>
      </div>""");
    HtmlElement container = querySelector("#${block.workspace.containerId}").parent;
    if (container == null) return;
    container.append(backdrop);

    querySelectorAll(".nt-param-confirm").onClick.listen((e) {
      var empties = querySelectorAll(".nt-expression.empty");
      if (empties.length > 0) return false;
      _value = builder.toJSON();
      backdrop.remove();
      acceptCallback();
      var val = CodeFormatter.formatExpression(_value);
      block.workspace.programChanged(new AttributeChangedEvent(this.block.id, this.block.instanceId, this.id, val));
    });

    querySelectorAll(".nt-param-confirm").onMouseDown.listen((e) {
      querySelectorAll(".nt-expression.empty").forEach((el) => el.classes.add('warn'));
    });
    querySelectorAll(".nt-param-confirm").onMouseUp.listen((e) {
      querySelectorAll(".nt-expression.empty").forEach((el) => el.classes.remove('warn'));
    });
    querySelectorAll(".nt-param-cancel").onClick.listen((e) {
      backdrop.remove();
    });

    backdrop.classes.add("show");

    builder.open("#nt-expression-${id}");

    querySelectorAll(".nt-param-dialog").onClick.listen((e) {
      querySelectorAll('.nt-pulldown-menu').forEach((el) => el.remove());
    });
  }
}
