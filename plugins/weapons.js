/**
 * A class representing the player's weapons
 */
class WeaponsRepo extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager){
        super(pluginManager);
        let d = {
            // The default weapon is a BB gun
            items: [
                {
                    name: "BB Gun",
                    fireRate: 500,
                    damage: 25,
                    range: 300,
                    velocity: 750,
                    mods: {}
                },
                {
                    name: "Shotgun",
                    fireRate: 1000,
                    damage: 50,
                    range: 225,
                    velocity: 900,
                    mods: {}
                },
                {
                    name: "Machine Gun",
                    fireRate: 150,
                    damage: 75,
                    range: 350,
                    velocity: 1000,
                    mods: {}
                }
            ]};
        this.default = JSON.stringify(d);
        let json = localStorage.getItem('weapons');
        if(json) this.weapons = JSON.parse(json);
        else this.reset();
    }

    /**
     * gets a weapon with a matching name
     * @param name the weapon name
     * @return {T} the weapon with the provided name
     */
    get(name) {
        return this.weapons.items.find(i => i.name === name);
    }

    getModdedWeapons(weapon) {
        let modded = {};
        modded.name = weapon.name;
        modded.fireRate = weapon.fireRate + ( weapon.mods.speed || 0);
        modded.damage = weapon.damage + ( weapon.mods.damage || 0);
        modded.range = weapon.range + ( weapon.mods.range || 0);
        modded.velocity = weapon.velocity + ( weapon.mods.velocity || 0);
        return modded;
    }

    addRange(weapon, amt) {
        let gun = this.weapons.items.find( w => w.name === weapon);
        if(gun) {
            if(gun.mods.range) gun.mods.range += amt
            else gun.mods.range = amt;
        }
    }

    addDamage(weapon, amt) {
        let gun = this.weapons.items.find( w => w.name === weapon);
        if(gun) {
            if(gun.mods.damage) gun.mods.damage += amt
            else gun.mods.damage = amt;
        }
    }

    addVelocity(weapon, amt) {
        let gun = this.weapons.items.find( w => w.name === weapon);
        if(gun) {
            if(gun.mods.velocity) gun.mods.velocity += amt
            else gun.mods.velocity = amt;
        }
    }
    
    addSpeed(weapon, amt) {
        let gun = this.weapons.items.find( w => w.name === weapon);
        if(gun) {
            if(gun.mods.speed) gun.mods.speed -= amt
            else gun.mods.speed = amt;
        }
    }

    /**
     * Resets the player's inventory to the defaults.
     */
    reset(){
        this.weapons = JSON.parse(this.default);
        this.save();
    }

    /**
     * Checks if the inventory is at the default state
     * @returns {boolean} true if reset else false
     */
    isReset(){
        return JSON.stringify(this.weapons) === this.default;
    }

    /**
     * Save the current inventory to the browser's local storage.
     */
    save() {
        localStorage.setItem('weapons', JSON.stringify(this.weapons));
    }
}