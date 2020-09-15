/**
 * A class for interacting and storing the player's inventory items. This is a
 * repository pattern that will initialize itself from the browser's local
 * storage. It will also save itself to the localstorage. It extends from
 * Phaser's BasePlugin and will be loaded and available for all scenes
 * of the game.
 */
class InventoryRepo extends Phaser.Plugins.BasePlugin {

    /**
     * The constructor for the plugin
     * @param pluginManager the phaser plugin manager
     */
    constructor(pluginManager) {
        super(pluginManager);
        let d = {
            cash: 50.00,
            tickets: 0,
            tokens: 0,
            items: [],
            speed: 75,
            hp: 100,
            weapons: []
        };
        this.default = JSON.stringify(d);
        let json = localStorage.getItem('inventory');
        if(json) this.inv = JSON.parse(json);
        else this.reset();
    }

    /**
     * gets the current cash the player has
     * @returns {number} the amount of dollars
     */
    cash() {
        return this.inv.cash;
    }

    /**
     * Checks if the player has the required amount of cash in their inventory.
     * @param amt the amount required
     * @returns {boolean} true if they have enough otherwise false
     */
    hasCash(amt){
        return amt <= this.inv.cash;
    }

    /**
     * Gets and amount of cash from the player's inventory
     * @param amt the amount to get
     * @returns {number|*} The cash amount or 0 if the player does not have the specified amount.
     */
    getCash(amt) {
        if(!this.hasCash(amt)) return 0;
        this.inv.cash -= amt;
        return amt;
    }

    /**
     * Adds the amount of cash to the player's inventory
     * @param amt the amount to add
     */
    addCash(amt) {
        this.inv.cash += amt;
    }

    /**
     * Get the number of tickets in the player's inventory
     * @returns {null} the number of tickets they player has.
     */
    tickets() {
        return this.inv.tickets;
    }

    /**
     * Adds the specified amount of tickets to the player's inventory.
     * @param amt the number of tickets to add
     */
    addTickets(amt) {
        this.inv.tickets += amt;
    }

    /**
     * Check if the player has the required amount of tickets in their inventory.
     * @param amt the amount of tickets required
     * @returns {boolean} true if they have the required amount otherwise false.
     */
    hasTickets(amt){
        return amt <= this.inv.tickets;
    }

    /**
     * Gets the specified amount of tickets from the players inventory.
     * @param amt the number of tickets to get.
     * @returns {number|*} the number of tickets required or 0 if the player does not have enough tickets.
     */
    getTickets(amt) {
        if(!this.hasTickets(amt)) return 0;
        this.inv.tickets -= amt;
        return amt;
    }

    /**
     * Get the number of tokens in the player's inventory
     * @returns {null} the number of tokens they player has.
     */
    tokens() {
        return this.inv.tokens;
    }

    /**
     * Adds the specified amount of tokens to the player's inventory.
     * @param amt the number of tokens to add
     */
    addTokens(amt) {
        this.inv.tokens += amt;
    }

    /**
     * Check if the player has the required amount of tokens in their inventory.
     * @param amt the amount of tokens required
     * @returns {boolean} true if they have the required amount otherwise false.
     */
    hasTokens(amt){
        return amt <= this.inv.tokens;
    }

    /**
     * Gets the specified amount of tokens from the players inventory.
     * @param amt the number of tokens to get.
     * @returns {number|*} the number of tokens required or 0 if the player does not have enough tokens.
     */
    getTokens(amt) {
        if(!this.hasTickets(amt)) return 0;
        this.inv.tokens -= amt;
        return amt;
    }

    /**
     * Gets the items owned by the player
     * @returns {[]} the array of items
     */
    items(){
        return this.inv.items;
    }

    /**
     * Checks if the player own the specified item.
     * @param itm the item or array of items to check
     * @returns {boolean} true if the player has the item otherwise false
     */
    owns(itm) {
        if(Array.isArray(itm)){
            let result = true;
            itm.forEach(i => {
                result = result && this.owns(i);
            }, this)
            return result;
        }
        return this.inv.items.includes(itm);
    }

    /**
     * Gets and removes the specified item from the player's inventory.
     * @param itm the item or array of items to remove.
     * @returns {*} the item or null if the player does not have the item.
     */
    getItem(itm) {
        if(!this.owns(itm)) return null;
        if(Array.isArray(itm)){
            let itms = [];
            itm.forEach(i => itms.push(this.getItem(i)), this);
            return itms;
        }
        let i = this.inv.items.findIndex(e => e === itm);
        if(i < 0) return null;
        let result = this.inv.items[i];
        this.inv.items.splice(i, 1);
        return result;
    }

    /**
     * Adds the provided item to the players inventory.
     * @param itm the item or array of items to add.
     */
    addItem(itm) {
        if(Array.isArray(itm)) this.inv.items = this.inv.items.concat(itm);
        else this.inv.items.push(itm);
    }

    /**
     * Gets the player's active weapon or if one isn't set, sets the
     * first weapon in the inventory as the active weapon.
     * @return {*} the name of the active weapon or nothing
     */
    getActiveWeapon() {
        if(this.inv.weapon) return this.inv.weapon;
        let w = this.inv.weapons[0];
        if(w) this.inv.weapon = w;
        return w;
    }

    /**
     * Sets the player's active weapon to the one specified, if it exists
     * in the player's inventory. Otherwise the active weapon doesn't change.
     * @param weapon the name of the weapon to set active.
     */
    setActiveWeapon(weapon) {
        if(!this.inv.weapons.find(w => w === weapon)) return;
        this.inv.weapon = weapon;
    }

    /**
     * Adds a new weapon to the player's inventory.
     * @param weapon an array of weapon names or a weapon name
     */
    addWeapon(weapon) {
        if(Array.isArray(weapon)) {
            weapon.forEach( w => this.addWeapon(w));
            return;
        }
        if(this.inv.weapons.find(w => w === weapon)) return;
        this.inv.weapons.push(weapon);
    }

    /**
     * Resets the player's inventory to the defaults.
     */
    reset(){
        this.inv = JSON.parse(this.default);
        this.save();
    }

    /**
     * Checks if the inventory is at the default state
     * @returns {boolean} true if reset else false
     */
    isReset(){
        return JSON.stringify(this.inv) === this.default;
    }

    /**
     * Save the current inventory to the browser's local storage.
     */
    save() {
        localStorage.setItem('inventory', JSON.stringify(this.inv));
    }

}