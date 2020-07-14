/*
 * NetTango
 * Copyright (c) 2020 Michael S. Horn, Uri Wilensky, and Corey Brady
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

class BlockDragData {
  int chainIndex;
  String parentType;
  int parentInstanceId;
  int clauseIndex;
  int blockIndex;
  int slotIndex;
  Iterable<Block> siblings;

  void reset() {
    chainIndex       = null;
    parentType       = null;
    parentInstanceId = null;
    clauseIndex      = null;
    blockIndex       = null;
    slotIndex        = null;
  }

  static BlockDragData newBlock(int slotIndex) {
    BlockDragData dragData = new BlockDragData();
    dragData.parentType = "new-block";
    dragData.slotIndex = slotIndex;
    return dragData;
  }

  void resetWorkspaceChain(int chainIndex, int blockIndex, Iterable<Block> siblings) {
    reset();
    this.chainIndex = chainIndex;
    this.parentType = "workspace-chain";
    this.blockIndex = blockIndex;
    this.siblings   = siblings;
  }

  static BlockDragData workspaceChain(int chainIndex, int blockIndex, Iterable<Block> siblings) {
    BlockDragData dragData = new BlockDragData();
    dragData.resetWorkspaceChain(chainIndex, blockIndex, siblings);
    return dragData;
  }

  void resetBlockOwned(int chainIndex, int blockIndex, int parentInstanceId, Iterable<Block> siblings, {int clauseIndex = null}) {
    reset();
    this.chainIndex       = chainIndex;
    this.parentType       = (clauseIndex == null) ? "block-children": "block-clause";
    this.parentInstanceId = parentInstanceId;
    this.blockIndex       = blockIndex;
    this.clauseIndex      = clauseIndex;
    this.siblings         = siblings;
  }

  static BlockDragData blockOwned(int chainIndex, int blockIndex, int parentInstanceId, Iterable<Block> siblings, {int clauseIndex = null}) {
    BlockDragData dragData = new BlockDragData();
    dragData.resetBlockOwned(chainIndex, blockIndex, parentInstanceId, siblings, clauseIndex: clauseIndex);
    return dragData;
  }
}