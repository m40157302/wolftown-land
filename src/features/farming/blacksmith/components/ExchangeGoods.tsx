import { useActor } from "@xstate/react";
import classNames from "classnames";
import Decimal from "decimal.js-light";
import React, { useContext, useState } from "react";

import token from "assets/wt/balance.png";
import { Box } from "components/ui/Box";
import { Button } from "components/ui/Button";
import { OuterPanel } from "components/ui/Panel";
import { Context } from "features/game/GameProvider";
import { ToastContext } from "features/game/toast/ToastQueueProvider";
import { CraftableItem } from "features/game/types/craftables";
import { InventoryItemName } from "features/game/types/game";
import { ITEM_DETAILS } from "features/game/types/images";
import { reward } from "hooks/WolfConfig";
import { getContractHandler } from "hooks/ethereum";
import { GoodsForNft } from "components/ui/GoodsForNft";
interface Props {
  items: Partial<Record<InventoryItemName, CraftableItem>>;
  isBulk?: boolean;
  onClose: () => void;
}

export interface WolfUserGoodsToChain {
  id: string;
  sign: string;
  name: string;
  image: string;
  goodsFalseId: string;
  owner: string;
  attribute: string; //0待核销   1已核销
  ctime: Date;
}

export const ExchangeGoods: React.FC<Props> = ({
  items,
  onClose,
  isBulk = false,
}) => {
  const [selected, setSelected] = useState<CraftableItem>(
    Object.values(items)[0]
  );

  const [selectedResult, setSelectedResult] = useState<WolfUserGoodsToChain>();

  const { setToast } = useContext(ToastContext);
  const { gameService, shortcutItem } = useContext(Context);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [message, setMessage] = useState("");
  const [
    {
      context: { state },
    },
  ] = useActor(gameService);
  const inventory = state.inventory;

  const lessFunds = (amount = 1) => {
    if (!selected.tokenAmount) return;

    return state.balance.lessThan(selected.tokenAmount.mul(amount));
  };

  //兑换到链上
  const handleNextReward = async (goodsName: string) => {
    const result = await reward(goodsName);

    if (!result.success) {
      setMessage(result.message);
    } else {
      const item = result.result.wolfUserGoodsToChain;
      setSelectedResult({
        id: item.id,
        name: item.goodsName,
        goodsFalseId: item.goodsFalseId,
        image: item.goodsUrl,
        sign: item.sign,
        owner: result.result.owner,
        attribute: item.writeOff,
        ctime: item.createTime,
      });
      await handleNextToChain(
        result.result.owner,
        item.goodsFalseId,
        item.sign
      );
      setMessage("Request succeeded!");
    }
  };

  //兑换到链上
  const handleNextToChain = async (
    owner: string | undefined,
    falseid: string | undefined,
    sign: string | undefined
  ) => {
    //链上操作
    const contractss = await getContractHandler("WTCheckWebFree");

    if (!contractss) return false;
    console.log(
      "WebtoChain",
      "owner:",
      owner,
      "falseid:",
      falseid,
      "sign:",
      sign
    );
    const mygo = await contractss.WebtoChain(owner, falseid, "wolftown", sign);
  };

  //兑换到链上
  const mint = async () => {
    //链上操作
    const contractss = await getContractHandler("WTAnimal");

    const wTCheckWebFree = await getContractHandler("WTCheckWebFree");
    if (!contractss) return false;
    if (!wTCheckWebFree) return false;
    //查询免费可用次数
    const mygo = await wTCheckWebFree.getAddressFreeLength(
      selectedResult?.owner
    );
    if (mygo > 0) {
      await contractss.mint();
    } else {
      setMessage("Insufficient free minutes");
    }
  };

  const Action = () => {
    return (
      <>
        <Button
          className="text-xxs sm:text-xs mt-1 whitespace-nowrap"
          onClick={() => handleNextReward(selected.name)}
        >
          Send To Chain
        </Button>

        <Button
          className="text-xxs sm:text-xs mt-1 whitespace-nowrap"
          onClick={() => mint()}
        >
          Mint
        </Button>
        <span className="text-xs mt-1 text-shadow">{message}</span>
      </>
    );
  };

  const stock = state.stock[selected.name] || new Decimal(0);

  return (
    <div className="flex">
      <div className="w-3/5 flex flex-wrap h-fit">
        {Object.values(items).map((item) => (
          <Box
            isSelected={selected.name === item.name}
            key={item.name}
            onClick={() => setSelected(item)}
            image={ITEM_DETAILS[item.name].image}
            count={inventory[item.name]}
          />
        ))}
      </div>
      <OuterPanel className="flex-1 w-1/3">
        <div className="flex flex-col justify-center items-center p-2 relative">
          <GoodsForNft item={selected} />
          <span className="text-shadow text-center">{selected.name}</span>
          <img
            src={ITEM_DETAILS[selected.name].image}
            className="h-16 img-highlight mt-1"
            alt={selected.name}
          />
          <span className="text-shadow text-center mt-2 sm:text-sm">
            {selected.description}
          </span>

          <div className="border-t border-white w-full mt-2 pt-1">
            {selected.ingredients?.map((ingredient, index) => {
              const item = ITEM_DETAILS[ingredient.item];
              const lessIngredient = new Decimal(
                inventory[ingredient.item] || 0
              ).lessThan(ingredient.amount);

              return (
                <div className="flex justify-center items-end" key={index}>
                  <img src={item.image} className="h-5 me-2" />
                  <span
                    className={classNames(
                      "text-xs text-shadow text-center mt-2 ",
                      {
                        "text-red-500": lessIngredient,
                      }
                    )}
                  >
                    {ingredient.amount.toNumber()}
                  </span>
                </div>
              );
            })}

            {/*      <div className="flex justify-center items-end">
              <img src={token} className="h-5 mr-1" />
              <span
                className={classNames("text-xs text-shadow text-center mt-2 ", {
                  "text-red-500": lessFunds(),
                })}
              >
                {`$${selected.tokenAmount?.toNumber()}`}
              </span>
            </div> */}
          </div>
          {Action()}
        </div>
      </OuterPanel>
    </div>
  );
};
