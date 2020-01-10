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

class CodeWorkspace {

  int version = VersionManager.VERSION;

  /// HTML Canvas ID
  String containerId;
  DivElement container, spaceDiv, drag;
  CssStyleSheet dragSheet;

  List<Chain> chains = new List<Chain>();

  int nextBlockId = 0;
  int nextBlockInstanceId = 0;

  /// save a copy of the workspace definition object for the save() function
  Map definition;

  /// block menu
  BlockMenu menu;

  /// global variable definitions and types
  List variables = new List();

  /// list of expressions
  List expressions = new List();

  int height, width, currentHeight;

/**
 * Construct a code workspace from a JSON object
 */
  CodeWorkspace(this.containerId, this.definition) {

    if (this.definition["version"] != VersionManager.VERSION) {
      throw "The supported NetTango version is ${VersionManager.VERSION}, but the given definition version was ${this.definition["version"]}.";
    }

    container = querySelector("#${containerId}");
    if (container == null) throw "No container element with ID $containerId found.";
    container.setInnerHtml("");
    container.classes.add("nt-container");
    if (container.parent != null) {
      container.parent.style.position = "relative";
    }

    height = definition["height"] is int ? definition["height"] : 600;
    width  = definition["width"]  is int ? definition["width"]  : 450;
    container.style.minHeight = "${height}px";
    container.style.minWidth  = "${width}px";
    currentHeight = height;

    //--------------------------------------------------------
    // initialize block menu
    //--------------------------------------------------------
    menu = new BlockMenu(this);
    if (definition['blocks'] is List) {
      // pre-check block IDs for our next one, as they may be out of order
      // and we'll need to set any that aren't set (new blocks) while processing
      for (var b in definition['blocks']) {
        int id = b['id'];
        if (id != null && id > nextBlockId) {
          nextBlockId = id + 1;
        }
      }
      for (var b in definition['blocks']) {
        Block block = new Block.fromJSON(this, b);
        if (menu.getBlockById(block.id) != null) {
          // duplicate block ID - wipe the ID and re-generate a new block with a new ID
          block.id = null;
          block = block.clone();
          b['id'] = block.id;
        }
        int limit = toInt(b['limit'], -1);
        menu.addBlock(block, limit);
      }
    }

    //--------------------------------------------------------
    // initialize global variables
    //--------------------------------------------------------
    if (definition['variables'] is List) {
      variables = definition['variables'];
    }

    //--------------------------------------------------------
    // initialize expression builder
    //--------------------------------------------------------
    if (definition['expressions'] is List) {
      expressions = definition['expressions'];
    }

    //--------------------------------------------------------
    // saved program state
    //--------------------------------------------------------
    if (definition['program'] is Map) {
      _restoreProgram(definition['program']);
    }

    draw();
  }

/**
 * Detaches this workspace object from the canvas
 */
  void unload() {
    chains.clear();
  }

/**
 * Callback when blocks of a program have changed
 */
  void programChanged(ProgramChangedEvent event) {
    try {
      js.context["NetTango"].callMethod("_relayCallback", [ containerId, event.toJS() ]);
    } catch (e) {
      print("Unable to relay program changed event to Javascript");
    }
  }

/**
 * Returns a JSON object representing the program's parse tree
 */
  Map exportParseTree() {
    Map json = {
      "chains": []
    };
    for (Chain chain in chains) {
      json["chains"].add(chain.exportParseTree());
    }

    for (Slot slot in menu.slots) {
      if (slot.block.required) {
        if (getBlockCount(slot.block.id) == 0) {
          json["chains"].add(slot.block.toJSON());
        }
      }
    }
    return json;
  }

  int getBlockCount(int id) {
    return chains.map( (c) => c.getBlockCount(id) ).reduce( (a, b) => a + b );
  }

  void draw() {
    spaceDiv = new DivElement() .. id = "${containerId}-space";
    spaceDiv.classes.add("nt-workspace");
    spaceDiv.onDragOver.listen( (e) => e.preventDefault() );
    spaceDiv.onDrop.listen( drop );
    container.append(spaceDiv);

    StyleElement dragStyleElement = new StyleElement();
    container.append(dragStyleElement);
    dragSheet = dragStyleElement.sheet;

    drag = new DivElement();
    drag.classes.add("nt-block-drag");
    drag.classes.add("nt-chain");
    spaceDiv.append(drag);

    if (chains.isEmpty) {
      return;
    }

    for (int i = 0; i < chains.length; i++) {
      Chain chain = chains[i];
      DivElement chainDiv = chain.draw(drag, dragSheet, i);
      spaceDiv.append(chainDiv);
    }

    final menuDiv = menu.draw(drag, dragSheet);
    container.append(menuDiv);

    updateWorkspaceHeight();
  }

  void drop(MouseEvent event) {
    event.stopPropagation();
    event.preventDefault();
    final json = jsonDecode(event.dataTransfer.getData("text/json"));
    final blockData = BlockDragData.fromJSON(json);

    if (blockData.parentType == "workspace-chain" && blockData.blockIndex == 0) {
      // just move if we're dragging a whole chain
      Chain chain = chains[blockData.chainIndex];
      repositionChain(chain, event.offset.x, event.offset.y);
      return;
    }

    final newBlocks = removeBlocksFromSource(blockData);
    createChain(newBlocks, event.offset.x, event.offset.y);
  }

  void createChain(Iterable<Block> newBlocks, int x, int y) {
    Chain newChain = new Chain();
    int newChainIndex = chains.length;
    chains.add(newChain);
    DivElement chainDiv = newChain.draw(drag, dragSheet, newChainIndex);
    spaceDiv.append(chainDiv);
    newChain.addBlocks(newChainIndex, newBlocks);
    repositionChain(newChain, x, y);
  }

  Iterable<Block> removeChain(int chainIndex) {
    Chain oldChain = chains[chainIndex];
    final blocks = oldChain.blocks;
    chains.removeAt(chainIndex);
    oldChain._chainDiv.remove();
    for (int i = 0; i < chains.length; i++) {
      Chain chain = chains[i];
      chain.resetDragData(i);
      chain.updatePosition();
    }
    updateWorkspaceHeight();
    return blocks;
  }

  Iterable<Block> removeBlocksFromSource(BlockDragData blockData) {
    switch (blockData.parentType) {

      case "new-block":
        final slot = menu.slots[blockData.slotIndex];
        slot._slotDiv.classes.remove("nt-block-drag-target");
        final instance = slot._newBlockInstance;
        instance._blockDiv.style.pointerEvents = "";

        return [instance];

      case "workspace-chain":
        if (blockData.blockIndex == 0) {
          return removeChain(blockData.chainIndex);
        } else {
          return chains[blockData.chainIndex].removeBlocks(blockData.chainIndex, blockData.blockIndex);
        }
        break;

      case "block-children":
        return chains[blockData.chainIndex]
          .getBlockInstance(blockData.parentInstanceId)
          .removeChildBlocks(blockData.blockIndex);

      case "block-clause":
        return chains[blockData.chainIndex]
          .getBlockInstance(blockData.parentInstanceId)
          .removeClauseBlocks(blockData.clauseIndex, blockData.blockIndex);

      case "default":
        throw new Exception("Unknown block removal type: ${blockData.parentType}");
        break;

    }

    // just to satisfy the compiler, this code is unreachable
    return [];
  }

  void repositionChain(Chain chain, int x, int y) {
    if (!chain.blocks.isEmpty) {
      Block first = chain.blocks[0];
      first.x = x;
      first.y = y;
      chain.updatePosition();
      updateWorkspaceHeight();
    }
  }

  void updateWorkspaceHeight() {
    int maxHeight = height; // start with the minimum height from the model
    final containerRect = container.getBoundingClientRect();
    for (Chain chain in chains) {
      final rect = chain._chainDiv.getBoundingClientRect();
      final childHeight = (rect.bottom - containerRect.top).ceil();
      if (childHeight > maxHeight) {
        maxHeight = childHeight;
      }
    }
    currentHeight = maxHeight + 1;
    container.style.minHeight = "${currentHeight}px";
  }

  /// restore a constructed program from a previously saved state
  void _restoreProgram(Map json) {
    if (json['chains'] is List) {
      for (var chain in json['chains']) {
        if (chain is List) {
          _restoreChain(chain);
        }
      }
    }
  }

  void _restoreChain(List chainJson) {
    Chain chain = new Chain();
    chains.add(chain);
    for (var b in chainJson) {
      if (b is Map) {
        chain.blocks.add(_restoreBlock(b));
      }
    }
  }

  /// restore a block from a previously saved program state
  Block _restoreBlock(Map json) {
    Block proto = menu.getBlockById(json["id"]);
    if (proto == null) {
      print("No prototype block found for id: ${json["id"]}");
      print(menu.slots.map( (s) { return s.block.id; }));
      return null;
    }

    Block block = proto.clone();

    if (json['x'] is num && json['y'] is num) {
      block.x = json['x'];
      block.y = json['y'];
    }

    _restoreParams(block, json['params'], json['properties']);

    if (json['children'] is List) {
      for (var childJson in json['children']) {
        if (childJson is Map) {
          Block child = _restoreBlock(childJson);
          block.children.add(child);
        }
      }
    }

    if (json['clauses'] is List) {
      for (var clauseJson in json['clauses']) {
        if (clauseJson is Map && clauseJson['children'] is List) {
          Chain clause = new Chain();
          block.clauses.add(clause);
          for (var childJson in clauseJson['children']) {
            Block child = _restoreBlock(childJson);
            clause.blocks.add(child);
          }
        }
      }
    }

    return block;
  }

  /// restore parameters for a block from a previously saved program
  void _restoreParams(Block block, List params, List properties) {
    if (params is List) {
      for (var param in params) {
        if (param is Map && param.containsKey('id') && param.containsKey('value') && block.params.containsKey(param['id'])) {
          final blockParam = block.params[param['id']];
          if (param["value"] is Map && ![ "bool", "num" ].contains(blockParam.type)) {
            blockParam.value = blockParam.defaultValue;
          } else {
            blockParam.value = param['value'];
          }
        }
      }
    }
    if (properties is List) {
      for (var prop in properties) {
        if (prop is Map && prop.containsKey('id') && prop.containsKey('value') && block.properties.containsKey(prop['id'])) {
          final blockProp = block.properties[prop['id']];
          if (prop["value"] is Map && ![ "bool", "num" ].contains(blockProp.type)) {
            blockProp.value = blockProp.defaultValue;
          } else {
            blockProp.value = prop['value'];
          }
        }
      }
    }
  }
}
