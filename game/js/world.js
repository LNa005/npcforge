/* ================================================
   world.js — Escena principal Phaser 3 (top-down)
   ================================================ */

const TILE  = 16;
const MAP   = 40;
const SPEED = 70;
const REACH = 22;

const preloadedImages = window.preloadedImages || {};

class WorldScene extends Phaser.Scene {

  constructor() {
    super({ key: 'WorldScene' });
    this.mapGrid    = [];
    this.player     = null;
    this.trees      = null;
    this.npcSprites = [];
    this.npcsData   = [];
    this.cursors    = null;
    this.wasd       = null;
    this.eKey       = null;
    this.nearbyNpc  = null;
    this.prompt     = null;
  }

  preload() {
    this.npcsData = Storage.getAll();
    Object.entries(preloadedImages).forEach(([key, img]) => {
      if (!this.textures.exists(key)) {
        this.textures.addImage(key, img);
      }
    });
  }

  create() {
    this._buildMap();
    this._drawBackground();   // un solo Graphics para todo el suelo
    this._drawTrees();        // un solo Graphics para todos los árboles
    this._placeTreeColliders();
    this._spawnPlayer();
    this._spawnNpcs();
    this._setupCamera();
    this._setupInput();
    this._makePromptLabel();
    if (this.npcsData.length === 0) this._emptyHint();
  }

  update() {
    if (Dialog.isOpen()) {
      this.player.setVelocity(0, 0);
      return;
    }

    const L = this.cursors.left.isDown  || this.wasd.A.isDown;
    const R = this.cursors.right.isDown || this.wasd.D.isDown;
    const U = this.cursors.up.isDown    || this.wasd.W.isDown;
    const D = this.cursors.down.isDown  || this.wasd.S.isDown;

    this.player.setVelocity(
      L ? -SPEED : R ? SPEED : 0,
      U ? -SPEED : D ? SPEED : 0
    );
    if ((L || R) && (U || D)) {
      this.player.body.velocity.normalize().scale(SPEED);
    }

    this._checkProximity();
  }

  /* ── Mapa procedural ── */
  _buildMap() {
    const C = MAP / 2;
    for (let y = 0; y < MAP; y++) {
      this.mapGrid[y] = [];
      for (let x = 0; x < MAP; x++) {
        const dx = Math.abs(x - C);
        const dy = Math.abs(y - C);
        if (x === C || y === C)        this.mapGrid[y][x] = 'path';
        else if (dx < 7 && dy < 7)     this.mapGrid[y][x] = 'grass';
        else this.mapGrid[y][x] = Math.random() < 0.22 ? 'tree' : 'grass';
      }
    }
  }

  /* ── Un único Graphics para todo el suelo ── */
  _drawBackground() {
    const g = this.add.graphics().setDepth(0);
    const grassColors = [0x4a7c3f, 0x4f8442, 0x527a3c, 0x486030];
    const darkColors  = [0x3d6b34, 0x426e37, 0x446831, 0x3c5228];

    for (let y = 0; y < MAP; y++) {
      for (let x = 0; x < MAP; x++) {
        const px = x * TILE;
        const py = y * TILE;

        if (this.mapGrid[y][x] === 'path') {
          g.fillStyle(0x8b7355).fillRect(px, py, TILE, TILE);
          g.fillStyle(0x9a8265)
           .fillRect(px + 2, py + 4, 3, 2)
           .fillRect(px + 9, py + 10, 3, 2);
        } else {
          const v = (x * 3 + y * 7) % 4;
          g.fillStyle(grassColors[v]).fillRect(px, py, TILE, TILE);
          g.fillStyle(darkColors[v])
           .fillRect(px, py, 2, 2)
           .fillRect(px + 13, py + 7, 2, 2);
        }
      }
    }
  }

  /* ── Un único Graphics para todos los árboles ── */
  _drawTrees() {
    const g = this.add.graphics().setDepth(5);
    for (let y = 0; y < MAP; y++) {
      for (let x = 0; x < MAP; x++) {
        if (this.mapGrid[y][x] !== 'tree') continue;
        const px = x * TILE;
        const py = y * TILE;
        g.fillStyle(0x2a4a18).fillRect(px + 1, py + 3, 14,  9);
        g.fillStyle(0x3a6a22).fillRect(px + 3, py + 1, 10,  5);
        g.fillStyle(0x1e3a10).fillRect(px + 3, py + 10, 10, 2);
        g.fillStyle(0x5c3a1e).fillRect(px + 6, py + 12, 4,  4);
      }
    }
  }

  /* ── Colisionadores invisibles para los árboles ── */
  _placeTreeColliders() {
    this.trees = this.physics.add.staticGroup();
    for (let y = 0; y < MAP; y++) {
      for (let x = 0; x < MAP; x++) {
        if (this.mapGrid[y][x] !== 'tree') continue;
        const zone = this.physics.add
          .staticImage(x * TILE + TILE / 2, y * TILE + TILE / 2)
          .setVisible(false);
        zone.setBodySize(TILE - 2, TILE - 2);
        this.trees.add(zone);
      }
    }
  }

  /* ── Jugador ── */
  _spawnPlayer() {
    const cx = (MAP / 2) * TILE + TILE / 2;

    if (this.textures.exists('player_spr')) {
      this.player = this.physics.add.sprite(cx, cx, 'player_spr');
    } else {
      const g = this.add.graphics();
      g.fillStyle(0xc9a84c).fillRect(0, 0, TILE, TILE);
      g.generateTexture('player_fb', TILE, TILE);
      g.destroy();
      this.player = this.physics.add.sprite(cx, cx, 'player_fb');
    }

    this.player.setCollideWorldBounds(true).setDepth(12);
    this.physics.world.setBounds(0, 0, MAP * TILE, MAP * TILE);
    this.physics.add.collider(this.player, this.trees);
  }

  /* ── NPCs ── */
  _spawnNpcs() {
    const C = MAP / 2;
    const offsets = [
      [-3,-3],[3,-3],[-3,3],[3,3],
      [0,-5],[-5,0],[5,0],[0,5],
      [-4,-1],[4,1],[-2,-4],[2,4],
    ];

    this.npcsData.forEach((npc, i) => {
      const [ox, oy] = offsets[i % offsets.length];
      const wx = (C + ox) * TILE + TILE / 2;
      const wy = (C + oy) * TILE + TILE / 2;
      const key = `npc_${npc.id}`;

      let sprite;
      if (this.textures.exists(key)) {
        sprite = this.physics.add.sprite(wx, wy, key);
      } else {
        const g = this.add.graphics();
        g.fillStyle(0xe8d0a0).fillRect(0, 0, TILE, TILE);
        const fbKey = `npc_fb_${i}`;
        g.generateTexture(fbKey, TILE, TILE);
        g.destroy();
        sprite = this.physics.add.sprite(wx, wy, fbKey);
      }

      sprite.setImmovable(true).setDepth(11).setData('npc', npc);
      this.physics.add.collider(this.player, sprite);

      this.add.text(wx, wy - 11, npc.form.nombre || '?', {
        fontSize: '5px', fontFamily: 'monospace',
        color: '#e8dfc8', backgroundColor: '#0d0c0eb0',
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5, 1).setDepth(25);

      this.npcSprites.push(sprite);
    });
  }

  /* ── Cámara ── */
  _setupCamera() {
    this.cameras.main
      .setZoom(2)
      .setBounds(0, 0, MAP * TILE, MAP * TILE)
      .startFollow(this.player, true, 0.1, 0.1);
  }

  /* ── Input ── */
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey('W'),
      A: this.input.keyboard.addKey('A'),
      S: this.input.keyboard.addKey('S'),
      D: this.input.keyboard.addKey('D'),
    };

    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.eKey.on('down', () => {
      if (this.nearbyNpc && !Dialog.isOpen()) {
        this.input.keyboard.enabled = false;
        this.player.setVelocity(0, 0);
        Dialog.open(this.nearbyNpc.getData('npc'), () => {
          this.input.keyboard.enabled = true;
        });
      }
    });
  }

  _makePromptLabel() {
    this.prompt = this.add.text(0, 0, '[E] Hablar', {
      fontSize: '5px', fontFamily: 'monospace',
      color: '#c9a84c', backgroundColor: '#0d0c0ecc',
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5, 1).setDepth(30).setVisible(false);
  }

  _emptyHint() {
    const cx = (MAP / 2) * TILE + TILE / 2;
    this.add.text(cx, cx + 24,
      'Crea personajes en NPCForge\npara poblar la aldea',
      {
        fontSize: '6px', fontFamily: 'monospace',
        color: '#c9a84c', backgroundColor: '#0d0c0ecc',
        padding: { x: 6, y: 4 }, align: 'center'
      }
    ).setOrigin(0.5).setDepth(20);
  }

  _checkProximity() {
    let closest = null;
    let minDist = Infinity;
    this.npcSprites.forEach(s => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, s.x, s.y);
      if (d < REACH && d < minDist) { minDist = d; closest = s; }
    });
    this.nearbyNpc = closest;
    this.prompt.setVisible(!!closest);
    if (closest) this.prompt.setPosition(closest.x, closest.y - 11);
  }
}