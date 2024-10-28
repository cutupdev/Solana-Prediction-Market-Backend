#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;
use states::*;

declare_id!("8aKi1kr5gcYcBSxBcnF5mXiuKk3rJBKagJxRwxDMWQBH");

#[program]
pub mod solanalottery {

    use super::*;

    pub fn initialize_config(
        _ctx: Context<InitializeConfig>,
        lottery_id: u64,
        start: u64,
        end: u64,
        price: u64,
    ) -> Result<()> {
        instructions::initialize_config(_ctx, lottery_id, start, end, price)?;
        Ok(())
    }

    pub fn initialize_lottery(_ctx: Context<InitializeLottery>) -> Result<()> {
        instructions::initialize_lottery(_ctx)?;
        Ok(())
    }

    pub fn buy_tickets(_ctx: Context<BuyTickets>, lottery_id: u64) -> Result<()> {
        instructions::buy_tickets(_ctx, lottery_id)?;
        Ok(())
    }

    pub fn commit_a_winner(_ctx: Context<CommitWinner>, lottery_id: u64) -> Result<()> {
        instructions::commit_a_winner(_ctx, lottery_id)?;
        Ok(())
    }

    pub fn choose_winner(_ctx: Context<ChooseWinner>, _lottery_id: u64) -> Result<()> {
        instructions::choose_winner(_ctx, _lottery_id)?;
        Ok(())
    }

    pub fn claim_prize(_ctx: Context<ClaimPrize>, _lottery_id: u64) -> Result<()> {
        instructions::claim_prize(_ctx, _lottery_id)?;
        Ok(())
    }
}
