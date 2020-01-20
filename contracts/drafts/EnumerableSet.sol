pragma solidity ^0.5.10;


/**
 * @title EnumerableSet
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
library EnumerableSet {

    event ValueAdded(address value);
    event ValueRemoved(address value);

    struct Set {
        // Position of the value in the `values` array, plus 1 because index 0
        // means a value is not in the set.
        mapping (address => uint256) index;
        address[] values;
    }

    /**
     * @dev Add a value.
     */
    function add(Set storage set, address value)
        internal
    {
        if (!contains(set, value)){
            set.index[value] = set.values.push(value);
            emit ValueAdded(value);
        }
    }

    /**
     * @dev Remove a value.
     */
    function remove(Set storage set, address value)
        internal
    {
        if (contains(set, value)) {
            set.values[set.index[value] - 1] = set.values[set.values.length - 1];
            set.values.pop();
            delete set.index[value];
            emit ValueRemoved(value);
        }
    }

    /**
     * @dev Returns true if the value is in the set.
     */
    function contains(Set storage set, address value)
        internal
        view
        returns (bool)
    {
        return set.index[value] != 0;
    }

    /**
     * @dev Return an array with all values in the set.
     */
    function enumerate(Set storage set)
        internal
        view
        returns (address[] memory)
    {
        address[] memory output = new address[](set.values.length);
        for (uint256 i; i < set.values.length; i++){
            output[i] = set.values[i];
        }
        return output;
    }
}
