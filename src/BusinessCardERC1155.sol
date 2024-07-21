// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

// Importaciones en Remix ide
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
using ECDSA for bytes32;

/// @title EducatETH - A simple ERC1155 NFT contract
/// @notice This contract allows the creation of NFTs with the same metadata for all tokens.
/// @dev This contract inherits from the Solmate ERC1155 implementation.
contract EducatETH is ERC1155, Ownable{
    /// @notice The name of the NFT collection
    string public name = "Business Card NFT";
    /// @notice The symbol of the NFT collection
    string public symbol = "BCN";
    /// @notice The base URI for the metadata of the NFTs
    /// @dev This URI points to the IPFS hash of the metadata JSON file.
    string public constant baseURI =
        "https://gateway.pinata.cloud/ipfs/Qmd2fouLxyJUKiH4EStUx7gbBtkozrnivnUUaA6bgxPmDf";

    error NotSigner();
    // error NOT_SIGNER();

    /// @notice Constructor that mints an initial NFT to the owner
    /// @param owner The address of the owner who will receive the initial minted NFT
    constructor(address owner) ERC1155(baseURI) Ownable(owner){
       // mint(owner, 1, 1); // Mintea un NFT con id 1 y cantidad 1 al creador del contrato
    }

    modifier verifySignature(
        address _signer,
        bytes32 _hash,
        bytes memory _signature
    ){
        _checkSigner(_signer, _hash, _signature);
        _;
    }

    /// @notice Returns the URI for the metadata of a given token ID
    /// @param id The ID of the token (not used in this implementation, but required by the ERC1155 standard)
    /// @return The base URI for the metadata
    function uri(uint256 id) public pure override returns (string memory) {
        return baseURI;//AHORA MISMO NO ES NECESARIO MAS QUE UN NFT, EL 1, 
    }

    /// @notice Mints a specified amount of a given token ID to a specified address
    /// @param _to The address to which the tokens will be minted
    /// @param _id The ID of the token to be minted
    /// @param _amount The quantity of the token to be minted
    function mint(address _to, uint256 _id, uint256 _amount) 
    // function mint(bytes32 _hash, bytes memory _signature, address _to, uint256 _id, uint256 _amount) 
    // public onlyOwner verifySignature(_to, _hash, _signature){
    public{ //TAL COMO ESTA NO USA LA FIRMA ENCRIPTADA NI EL ONLYOWNER
    // public verifySignature(_to, _hash, _signature){
        _mint(_to, _id, _amount, "");
        emit URI(baseURI, _id);
    }

    /// @notice Mints specified amounts of multiple token IDs to a specified address
    /// @param to The address to which the tokens will be minted
    /// @param ids An array of token IDs to be minted
    /// @param amounts An array of quantities of each token ID to be minted
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
         _mintBatch(to, ids, amounts, "");
        for (uint256 i = 0; i < ids.length; i++) {
            emit URI(baseURI, ids[i]);
        }
    }
    function _checkSigner(
        address _signer,
        bytes32 _hash,
        bytes memory _signature      
    ) internal pure{
        bool isSigner = _hash.recover(_signature) == _signer;
        if(!isSigner){
            revert NotSigner();
        }
        // if(!isSigner) revert NOT_SIGNER();
    }
}