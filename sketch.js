class GBOARD {
  constructor(parent) {
    this.parent = document.getElementById(parent);
    //64マスの情報の配列
    this.sq = new Array(64);
    for (let i=0; i<64; i++) {
    //一マスを表現するdiv
    let e = document.createElement('div');
    e.className = "sq";
    let x = (i % 8) * 53 + 35;
    let y = Math.floor(i / 8) * 53 + 35;
    e.style.left = x + "px";
    e.style.top = y + "px";
    
    e.parent = this;
    e.myid = i;
    e.addEventListener("click", function () {this.parent.OnClick(this.myid);});
    e.addEventListener("click", function () {this.parent.OnClick(this.myid);});
    //石を表現する
    let d = document.createElement('div');
    d.className = "disc";
    d.style.display = "none";
    e.appendChild ( d );
    e.disc = d;
    this.parent.appendChild(e);
      
    this.sq[i] = e;
    }
  }
  //(x, y) のマスに石を置く
  //d = 1 黒石を置く
  //d = 2 白石を置く
  setDisc (x, y, d) {
    let p = y * 8 + x;
    //d == 0の時は非表示
    this.sq[p].disc.style.display = d == 0 ? "none":"block";
    if(d > 0) {
      //石の色の指定によって背景色を切り替える
      this.sq[p].disc.style.backgroundColor = d == 1 ? "black":"white";
    }
}
  // othello bdを渡すことで盤面を表示
  update(bd) {
    for (let y=0; y<8; y++){
      for (let x=0; x<8; x++) {
        this.setDisc(x, y, bd.get(x, y));
      }
    } 
  }
  OnClick (id) {
    OnClickBoard(id);
  }
}

class MoveInfo {
  constructor () {
    this.turn = 0; //手番
    this.pos = 0;  //打った場所
    this.flips = 0; //裏返した石の場所 
    this.disc = new Array(20);
  }
  clear() {
    this.turn = 0;
    this.pos = 0;
    this.flips = 0;
  }
  addFlipDisc(p) {this.disc[this.flips++] = p;}
}

const VECT = [-10, -9, -8, -1, 1, 8, 9, 10];
class Othello {
  constructor () {
    this.bd = new Array (91);
    for (let i=0; i<this.bd.length; i++) {this.bd[i] = 8;}
    for (let y=0; y<8; y++) {
      for (let x=0; x<8; x++) {
        this.bd[this.pos(x, y)] = 0;
      }
    }
    this.bd[this.pos(3, 3)] = 1;
    this.bd[this.pos(4, 3)] = 2;
    this.bd[this.pos(3, 4)] = 2;
    this.bd[this.pos(4, 4)] = 1;
    
    this.moveinfo = new Array(60);
    this.mp = 0;
    this.mpmax = 0;
    
    this.turn = 1;
  }
  pos (x, y) {return (y+1) * 9 + x + 1;}
  pos_x(p) {return p % 9 - 1;}
  pos_y(p) {return Math.floor(p / 9) - 1;}
  
  init () {
    for (let y=0; y<8; y++) {
      for (let x=0; x<8; x++) {
        this.bd[this.pos(x, y)] = 0;
      }
    }
    this.bd[this.pos(3, 3)] = 1;
    this.bd[this.pos(4, 3)] = 2;
    this.bd[this.pos(3, 4)] = 2;
    this.bd[this.pos(4, 4)] = 1;
    
    this.mp = 0;
    this.mpmax = 0;
    this.turn = 1;
  }
  //(x, y)マスの状態を取得する
  get (x, y) {
    return this.bd[this.pos(x, y)];
  }
  //(x, y)のマスに打つ
  move (x, y) {
    let p = this.pos(x, y);
    if (this.bd [p] !=0) {//空きマスがなければ
      return 0;　　// 打てない
    }
    let moveinfo = new MoveInfo();
    let flipdiscs = 0;
    let oppdisc = this.turn == 2 ? 1:2;
    for (let v=0; v<VECT.length; v++) {　// 8方向全てについて
      let vect = VECT[v];
      
      let n = p + vect;//vect方向の隣のマス
      let flip = 0;
      while(this.bd[n] == oppdisc) {//　連続する相手の意思を
        n+= vect;
        flip++;              //カウントする。
      }
      if (flip > 0 && this.bd[n] == this.turn) {
        for (let i=0; i<flip; i++) {
          this.bd[n -= vect] = this.turn;
          moveinfo.addFlipDisc(n);
        }
        flipdiscs += flip;
      }
    }
    if (flipdiscs　> 0) {
      this.bd[p] = this.turn;
      
      moveinfo.pos = p;
      moveinfo.turn = this.turn;
      this.moveinfo[this.mp++] = moveinfo;
      this.mpmax = this.mp;
      
      this.SetNextTurn();
    }
    return flipdiscs;
  }
  SetNextTurn () {
    this.turn = this.turn == 2 ? 1:2;
    if (this.isPass(this.turn)) {
      this.turn = this.turn == 2 ? 1:2;
      if(this.isPass(this.turn)) {
        this.turn = 0;
      }
    }
  }
  isPass (turn) {
    for(let y=0; y<8; y++) {
      for(let x=0; x<8; x++) {
        if(this.canMove(x, y, turn)) {
          return false;
        }
      }
    }
    return true;
  }
   canMove (x, y, turn) {
    let p = this.pos(x, y);
    if (this.bd [p] !=0) {//空きマスがなければ
      return false;　　// 打てない
    }
    let flipdiscs = 0;
    let oppdisc = this.turn == 2 ? 1:2;
    for (let v=0; v<VECT.length; v++) {　// 8方向全てについて
      let vect = VECT[v];
      
      let n = p + vect;//vect方向の隣のマス
      let flip = 0;
      while(this.bd[n] == oppdisc) {//　連続する相手の意思を
        n+= vect;
        flip++;              //カウントする。
      }
      if (flip > 0 && this.bd[n] == this.turn) {
      return true;
      }
    }
    if (flipdiscs　> 0) {
      this.bd[p] = this.turn;
      this.SetNextTurn();
    }
    return false;
  }
  unmove () {
    if(this.mp <= 0) {
      return false;
    }
    let moveinfo = this.moveinfo[--this.mp];
    let opp = moveinfo.turn == 1 ? 2: 1;
    for (let i=0; i<moveinfo.flips; i++) {
      this.bd[moveinfo.disc[i]] = opp;
    }
    this.bd[moveinfo.pos] = 0;
    this.turn = moveinfo.turn;
    return true;
  }
  
  forward () {
    if(this.mp >= this.mpmax) {
      return false;
    }
    let moveinfo = this.moveinfo[this.mp++];
    let opp = moveinfo.turn == 1 ? 2: 1;
    
    for (let i=0; i<moveinfo.flips; i++) {
      this.bd [moveinfo.disc[i]] = moveinfo.turn;
    }
    this.bd[moveinfo.pos] = moveinfo.turn;
    
    this.turn = moveinfo.turn;
    this.SetNextTurn();
    
    return true;
  }
  
  unmove_all () {
    if(!this.unmove()) {
      return false;
    }
    while(this.unmove()) {
      ;
    }
    return true;
  }
  forward_all() {
    if(!this.forward ()) {
      return false;
    }
    while(this.forward()) {
      ;
    }
    return true;
  }
}

let gBoard = null;
let gOthello = null;

function init() {
  gOthello.init();
  gBoard.update(gOthello);
}

function unmove () {
  if (gOthello.unmove ()) {
    gBoard.update(gOthello);
  }
}

function forward () {
  if(gOthello.forward()) {
    gBoard.update(gOthello);
  }
}

function unmove_all () {
  if(gOthello.unmove_all()) {
    gBoard.update(gOthello);
  }
}

function forward_all () {
  if(gOtello.forward_all()) {
    gBoard.update(gOthello);
  }
}

function OnClickBoard (pos) {
  let x = pos % 8;
  let y = Math.floor(pos / 8);
  if (gOthello.move(x, y) > 0) {
    gBoard.update(gOthello);
  }
}
function setup() {
  noLoop();
  gBoard = new GBOARD("board");
  gOthello = new Othello();
  gBoard.update(gOthello);
}
function draw () {
  
}
