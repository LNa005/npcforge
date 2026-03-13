/* ================================================
   world.js — Mapa rico con casas, plaza y NPCs libres
   ================================================ */

const TILE  = 16;
const MAP   = 60;       // mapa más grande para las casas
const SPEED = 80;
const REACH = 26;
const NPC_SPEED   = 18;
const WANDER_DIST = 40; // px máximo de wandering desde home

const preloadedImages = window.preloadedImages || {};

/* ── Paleta ── */
const C = {
  grass0: 0x4a7c3f, grass1: 0x4f8442, grass2: 0x527a3c, grass3: 0x486030,
  dark0:  0x3d6b34, dark1:  0x426e37, dark2:  0x446831, dark3:  0x3c5228,
  path:   0x8b7355, pathDark: 0x7a6345, pathHi: 0x9a8265,
  plaza:  0x6b5b3e, plazaDark: 0x5a4a30, plazaHi: 0x7d6d4f,
  wallA:  0x8a6d3e, wallB: 0x7a5d2e, roof: 0x8b2020, roofDark: 0x6b1010,
  roofAlt: 0x1a4a8a, roofAltD: 0x0e2e5a,
  door:   0x5c3a1e, doorDark: 0x3a2010,
  win:    0xc8e8ff, winFrame: 0x5c3a1e,
  tree0:  0x2a4a18, tree1: 0x3a6a22, tree2: 0x1e3a10, trunk: 0x5c3a1e,
  fountain: 0x4a7aaa, fountainRim: 0x8a9aaa, fountainWater: 0x6ab4d8,
  bench:  0x7a5a2a, lantern: 0xd4a020, lanternGlow: 0xffd060,
};

class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
    this.mapGrid    = [];
    this.player     = null;
    this.solidGroup = null;   // grupo único de colisionadores estáticos
    this.npcSprites = [];     // { sprite, homeX, homeY, targetX, targetY, timer }
    this.npcsData   = [];
    this.cursors    = null;
    this.wasd       = null;
    this.eKey       = null;
    this.nearbyNpc  = null;
    this.promptLabel = null;
    this.bgGraphics  = null;
    this.fgGraphics  = null;
  }

  preload() {
    this.npcsData = Storage.getAll();
    Object.entries(preloadedImages).forEach(([key, img]) => {
      if (!this.textures.exists(key)) this.textures.addImage(key, img);
    });
  }

  create() {
    this.solidGroup = this.physics.add.staticGroup();

    this.bgGraphics = this.add.graphics().setDepth(0);
    this.fgGraphics = this.add.graphics().setDepth(6);

    this._buildMap();
    this._drawBackground();
    this._drawPlaza();
    this._drawPaths();
    this._drawTrees();
    this._drawHouses();
    this._drawDecoration();
    this._spawnPlayer();
    this._spawnNpcs();
    this._setupCamera();
    this._setupInput();
    this._makePromptLabel();

    if (this.npcsData.length === 0) this._emptyHint();
  }

  update(time, delta) {
    if (Dialog.isOpen()) {
      this.player.setVelocity(0, 0);
      return;
    }

    // Movimiento jugador
    const L = this.cursors.left.isDown  || this.wasd.A.isDown;
    const R = this.cursors.right.isDown || this.wasd.D.isDown;
    const U = this.cursors.up.isDown    || this.wasd.W.isDown;
    const D = this.cursors.down.isDown  || this.wasd.S.isDown;
    this.player.setVelocity(
      L ? -SPEED : R ? SPEED : 0,
      U ? -SPEED : D ? SPEED : 0
    );
    if ((L || R) && (U || D)) this.player.body.velocity.normalize().scale(SPEED);

    // Movimiento NPCs (wandering)
    this.npcSprites.forEach(n => {
      n.timer -= delta;
      if (n.timer <= 0) {
        // Elegir nuevo destino cerca del hogar
        const angle = Math.random() * Math.PI * 2;
        const dist  = Math.random() * WANDER_DIST;
        n.targetX = Phaser.Math.Clamp(n.homeX + Math.cos(angle) * dist, TILE, MAP * TILE - TILE);
        n.targetY = Phaser.Math.Clamp(n.homeY + Math.sin(angle) * dist, TILE, MAP * TILE - TILE);
        n.timer   = 2000 + Math.random() * 3000; // cada 2-5 segundos nuevo destino
      }

      // Mover hacia target
      const dx = n.targetX - n.sprite.x;
      const dy = n.targetY - n.sprite.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d > 3) {
        n.sprite.setVelocity((dx / d) * NPC_SPEED, (dy / d) * NPC_SPEED);
      } else {
        n.sprite.setVelocity(0, 0);
      }
    });

    this._checkProximity();
  }

  /* ──────────────────── MAPA ──────────────────── */

  _buildMap() {
    const cx = Math.floor(MAP / 2);
    for (let y = 0; y < MAP; y++) {
      this.mapGrid[y] = [];
      for (let x = 0; x < MAP; x++) {
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cx);
        // Plaza central 9×9
        if (dx <= 4 && dy <= 4)          this.mapGrid[y][x] = 'plaza';
        // Bosque exterior
        else if (dx > 22 || dy > 22)     this.mapGrid[y][x] = Math.random() < 0.45 ? 'tree' : 'grass';
        else                              this.mapGrid[y][x] = 'grass';
      }
    }
  }

  _drawBackground() {
    const g = this.bgGraphics;
    const grassC = [C.grass0, C.grass1, C.grass2, C.grass3];
    const darkC  = [C.dark0,  C.dark1,  C.dark2,  C.dark3];

    for (let y = 0; y < MAP; y++) {
      for (let x = 0; x < MAP; x++) {
        if (this.mapGrid[y][x] === 'plaza') continue; // plaza se dibuja aparte
        const px = x * TILE, py = y * TILE;
        const v  = (x * 3 + y * 7) % 4;
        g.fillStyle(grassC[v]).fillRect(px, py, TILE, TILE);
        g.fillStyle(darkC[v]).fillRect(px, py, 2, 2).fillRect(px + 13, py + 7, 2, 2);
      }
    }
  }

  _drawPlaza() {
    const g   = this.bgGraphics;
    const cx  = Math.floor(MAP / 2);
    const r   = 4; // radio de la plaza en tiles

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const px = (cx + dx) * TILE;
        const py = (cx + dy) * TILE;
        const v  = ((cx + dx) + (cx + dy)) % 2;
        g.fillStyle(v === 0 ? C.plaza : C.plazaDark).fillRect(px, py, TILE, TILE);
        // juntas
        g.fillStyle(C.plazaDark).fillRect(px, py, 1, TILE).fillRect(px, py, TILE, 1);
      }
    }

    // Borde de la plaza
    g.lineStyle(2, C.plazaHi, 1);
    g.strokeRect((cx - r) * TILE, (cx - r) * TILE, (r * 2 + 1) * TILE, (r * 2 + 1) * TILE);

    // Fuente central
    const fx = cx * TILE + TILE / 2;
    const fy = cx * TILE + TILE / 2;
    g.fillStyle(C.fountainRim) .fillCircle(fx, fy, 14);
    g.fillStyle(C.fountain)    .fillCircle(fx, fy, 11);
    g.fillStyle(C.fountainWater).fillCircle(fx, fy, 8);
    g.fillStyle(0xffffff, 0.6) .fillCircle(fx - 3, fy - 3, 2);

    // Colisionador de la fuente
    const fZone = this.physics.add.staticImage(fx, fy).setVisible(false);
    fZone.setBodySize(20, 20);
    this.solidGroup.add(fZone);
  }

  _drawPaths() {
    const g  = this.bgGraphics;
    const cx = Math.floor(MAP / 2);

    // Caminos cardinales desde la plaza hacia fuera
    const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
    dirs.forEach(({ dx, dy }) => {
      for (let i = 5; i <= 18; i++) {
        const px = (cx + dx * i) * TILE;
        const py = (cx + dy * i) * TILE;
        // camino de 2 tiles de ancho
        for (let w = -1; w <= 1; w++) {
          const bx = px + (dy !== 0 ? w * TILE : 0);
          const by = py + (dx !== 0 ? w * TILE : 0);
          g.fillStyle(C.path).fillRect(bx, by, TILE, TILE);
          g.fillStyle(C.pathHi).fillRect(bx + 2, by + 4, 3, 2).fillRect(bx + 9, by + 10, 3, 2);
        }
      }
    });
  }

  _drawTrees() {
    const fg = this.fgGraphics;
    for (let y = 0; y < MAP; y++) {
      for (let x = 0; x < MAP; x++) {
        if (this.mapGrid[y][x] !== 'tree') continue;
        const px = x * TILE, py = y * TILE;
        fg.fillStyle(C.tree0).fillRect(px + 1, py + 3, 14, 9);
        fg.fillStyle(C.tree1).fillRect(px + 3, py + 1, 10, 5);
        fg.fillStyle(C.tree2).fillRect(px + 3, py + 10, 10, 2);
        fg.fillStyle(C.trunk).fillRect(px + 6, py + 12, 4, 4);

        const z = this.physics.add.staticImage(px + TILE/2, py + TILE/2).setVisible(false);
        z.setBodySize(TILE - 2, TILE - 2);
        this.solidGroup.add(z);
      }
    }
  }

  /* ──────────────────── CASAS ──────────────────── */

  // Posiciones de las casas alrededor de la plaza (en tiles desde el centro)
  _housePositions() {
    return [
      { ox: -9,  oy: -9  },
      { ox:  9,  oy: -9  },
      { ox: -9,  oy:  9  },
      { ox:  9,  oy:  9  },
      { ox:  0,  oy: -12 },
      { ox:  0,  oy:  12 },
      { ox: -12, oy:  0  },
      { ox:  12, oy:  0  },
      { ox: -10, oy:  5  },
      { ox:  10, oy:  5  },
      { ox: -10, oy: -5  },
      { ox:  10, oy: -5  },
    ];
  }

  _drawHouses() {
    const cx  = Math.floor(MAP / 2);
    const pos = this._housePositions();
    const roofColors = [
      [C.roof, C.roofDark],
      [C.roofAlt, C.roofAltD],
      [0x2a6a2a, 0x1a4a1a],
      [0x6a2a6a, 0x4a1a4a],
    ];

    this.npcsData.forEach((npc, i) => {
      if (i >= pos.length) return;
      const { ox, oy } = pos[i];
      const hx = (cx + ox) * TILE;
      const hy = (cx + oy) * TILE;
      const [rc, rd] = roofColors[i % roofColors.length];
      this._drawHouse(hx, hy, rc, rd, npc.form.nombre || '?');
    });

    // Casas vacías decorativas si hay menos de 4 NPCs
    const extras = Math.max(0, 4 - this.npcsData.length);
    for (let i = 0; i < extras; i++) {
      const idx = this.npcsData.length + i;
      if (idx >= pos.length) break;
      const { ox, oy } = pos[idx];
      const [rc, rd] = roofColors[idx % roofColors.length];
      this._drawHouse((cx + ox) * TILE, (cx + oy) * TILE, rc, rd, null);
    }
  }

  _drawHouse(wx, wy, roofColor, roofDark, npcName) {
    const g  = this.bgGraphics;
    const fg = this.fgGraphics;
    const W  = 5 * TILE;  // ancho casa
    const H  = 4 * TILE;  // alto casa (sin tejado)
    const lx = wx - W / 2;
    const ly = wy - H / 2;

    // Suelo alrededor
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const px = wx + dx * TILE - TILE/2;
        const py = wy + dy * TILE - TILE/2;
        if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3) {
          g.fillStyle(C.path).fillRect(px, py, TILE, TILE);
        }
      }
    }

    // Paredes
    g.fillStyle(C.wallA).fillRect(lx, ly, W, H);
    // Sombra lateral
    g.fillStyle(C.wallB).fillRect(lx + W - 4, ly, 4, H);
    // Ventanas
    const winY = ly + TILE;
    [lx + 6, lx + W - TILE - 2].forEach(wx2 => {
      g.fillStyle(C.winFrame).fillRect(wx2, winY, 10, 10);
      g.fillStyle(C.win).fillRect(wx2 + 2, winY + 2, 6, 6);
    });
    // Puerta centrada
    const doorX = lx + W / 2 - 6;
    const doorY = ly + H - 14;
    g.fillStyle(C.door).fillRect(doorX, doorY, 12, 14);
    g.fillStyle(C.doorDark).fillRect(doorX + 5, doorY + 4, 2, 6);

    // Tejado (triángulo con rectángulos)
    fg.fillStyle(roofColor);
    for (let row = 0; row < 5; row++) {
      const rw = W - row * 10;
      const rx = lx + row * 5;
      const ry = ly - (5 - row) * 6;
      fg.fillRect(rx, ry, rw, 8);
    }
    fg.fillStyle(roofDark);
    for (let row = 0; row < 5; row++) {
      const rw = W - row * 10;
      const rx = lx + row * 5;
      const ry = ly - (5 - row) * 6 + 6;
      fg.fillRect(rx, ry, rw, 2);
    }

    // Nombre del NPC encima de la puerta
    if (npcName) {
      this.add.text(wx, ly - 28, npcName, {
        fontSize: '5px', fontFamily: 'monospace',
        color: '#e8dfc8', backgroundColor: '#0d0c0ecc',
        padding: { x: 3, y: 2 }
      }).setOrigin(0.5, 1).setDepth(20);
    }

    // Colisionador de la casa
    const z = this.physics.add.staticImage(wx, wy - 6).setVisible(false);
    z.setBodySize(W - 4, H - 4);
    this.solidGroup.add(z);
  }

  /* ──────────────────── DECORACIÓN ──────────────────── */

  _drawDecoration() {
    const g  = this.bgGraphics;
    const cx = Math.floor(MAP / 2);

    // Bancos en las esquinas de la plaza
    const benchOffsets = [[-3,-5],[-3,5],[3,-5],[3,5]];
    benchOffsets.forEach(([bx, by]) => {
      const px = (cx + bx) * TILE;
      const py = (cx + by) * TILE;
      g.fillStyle(C.bench);
      g.fillRect(px - 6, py, 12, 4);   // tablón
      g.fillRect(px - 6, py + 4, 2, 4); // pata izq
      g.fillRect(px + 4, py + 4, 2, 4); // pata der
    });

    // Faroles en los 4 accesos a la plaza
    const lanternOffsets = [[-5,0],[5,0],[0,-5],[0,5]];
    lanternOffsets.forEach(([lx2, ly2]) => {
      const px = (cx + lx2) * TILE + TILE/2;
      const py = (cx + ly2) * TILE + TILE/2;
      g.fillStyle(0x5c3a1e).fillRect(px - 1, py - 8, 2, 12); // poste
      g.fillStyle(C.lantern).fillRect(px - 3, py - 12, 6, 6); // cabeza
      g.fillStyle(C.lanternGlow).fillRect(px - 2, py - 11, 4, 4); // luz
    });

    // Señal de bienvenida en el camino norte
    const sx = (cx) * TILE + TILE/2;
    const sy = (cx - 15) * TILE;
    g.fillStyle(C.trunk).fillRect(sx - 1, sy, 2, 18);
    g.fillStyle(C.wallA).fillRect(sx - 18, sy + 2, 36, 12);
    this.add.text(sx, sy + 8, '✦ ALDEA ✦', {
      fontSize: '4px', fontFamily: 'monospace',
      color: '#1a1010'
    }).setOrigin(0.5).setDepth(7);
  }

  /* ──────────────────── JUGADOR ──────────────────── */

  _spawnPlayer() {
    const cx = Math.floor(MAP / 2) * TILE + TILE/2;

    if (this.textures.exists('player_spr')) {
      this.player = this.physics.add.sprite(cx, cx, 'player_spr');
    } else {
      const g = this.add.graphics();
      g.fillStyle(0xc9a84c).fillRect(0, 0, TILE, TILE);
      g.generateTexture('player_fb', TILE, TILE); g.destroy();
      this.player = this.physics.add.sprite(cx, cx, 'player_fb');
    }

    this.player.setCollideWorldBounds(true).setDepth(12);
    this.physics.world.setBounds(0, 0, MAP * TILE, MAP * TILE);
    this.physics.add.collider(this.player, this.solidGroup);
  }

  /* ──────────────────── NPCs ──────────────────── */

  _spawnNpcs() {
    const cx  = Math.floor(MAP / 2);
    const pos = this._housePositions();

    this.npcsData.forEach((npc, i) => {
      if (i >= pos.length) return;
      const { ox, oy } = pos[i];
      // Spawn delante de la puerta de la casa
      const wx = (cx + ox) * TILE + TILE/2;
      const wy = (cx + oy) * TILE + TILE * 2.5; // delante de la puerta
      const key = `npc_${npc.id}`;

      let sprite;
      if (this.textures.exists(key)) {
        sprite = this.physics.add.sprite(wx, wy, key);
      } else {
        const g = this.add.graphics();
        g.fillStyle(0xe8d0a0).fillRect(0, 0, TILE, TILE);
        const fbKey = `npc_fb_${i}`;
        g.generateTexture(fbKey, TILE, TILE); g.destroy();
        sprite = this.physics.add.sprite(wx, wy, fbKey);
      }

      sprite.setDepth(11).setData('npc', npc);
      this.physics.add.collider(sprite, this.solidGroup);

      this.npcSprites.push({
        sprite,
        homeX:   wx,
        homeY:   wy,
        targetX: wx,
        targetY: wy,
        timer:   Math.random() * 2000, // desfase inicial
      });
    });
  }

  /* ──────────────────── CÁMARA / INPUT ──────────────────── */

  _setupCamera() {
    this.cameras.main
      .setZoom(2.5)
      .setBounds(0, 0, MAP * TILE, MAP * TILE)
      .startFollow(this.player, true, 0.1, 0.1);
  }

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
    this.promptLabel = this.add.text(0, 0, '[E] Hablar', {
      fontSize: '5px', fontFamily: 'monospace',
      color: '#c9a84c', backgroundColor: '#0d0c0ecc',
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5, 1).setDepth(30).setVisible(false);
  }

  _emptyHint() {
    const cx = Math.floor(MAP / 2) * TILE + TILE/2;
    this.add.text(cx, cx + 30,
      'Crea personajes en NPCForge\npara poblar la aldea',
      { fontSize: '6px', fontFamily: 'monospace', color: '#c9a84c',
        backgroundColor: '#0d0c0ecc', padding: { x: 6, y: 4 }, align: 'center' }
    ).setOrigin(0.5).setDepth(20);
  }

  _checkProximity() {
    let closest = null;
    let minDist = Infinity;
    this.npcSprites.forEach(n => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.sprite.x, n.sprite.y);
      if (d < REACH && d < minDist) { minDist = d; closest = n.sprite; }
    });
    this.nearbyNpc = closest;
    this.promptLabel.setVisible(!!closest);
    if (closest) this.promptLabel.setPosition(closest.x, closest.y - 13);
  }
}