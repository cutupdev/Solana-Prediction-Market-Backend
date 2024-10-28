use crate::constants::*;
use crate::LotteryConfig;
use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    MetadataAccount,
    Metadata,
};
use anchor_spl::token_interface::{ Mint, TokenAccount, TokenInterface};

use crate::errors::ErrorCode;

pub fn claim_prize(ctx: Context<ClaimPrize>, _lottery_id : u64) -> Result<()> {

      // Check if winner has been chosen
      msg!("Winner chosen: {}", ctx.accounts.token_lottery.winner_chosen);
      require!(ctx.accounts.token_lottery.winner_chosen, ErrorCode::WinnerNotChosen);
      
      // Check if token is a part of the collection
      require!(ctx.accounts.metadata.collection.as_ref().unwrap().verified, ErrorCode::NotVerifiedTicket);
      require!(ctx.accounts.metadata.collection.as_ref().unwrap().key == ctx.accounts.collection_mint.key(), ErrorCode::IncorrectTicket);

      let ticket_name = NAME.to_owned() + &ctx.accounts.token_lottery.winner.to_string();
      let metadata_name = ctx.accounts.metadata.name.replace("\u{0}", "");


      msg!("Ticket name: {}", ticket_name);
      msg!("Metdata name: {}", metadata_name);

      // Check if the winner has the winning ticket
      require!(metadata_name == ticket_name, ErrorCode::IncorrectTicket);
      require!(ctx.accounts.destination.amount > 0, ErrorCode::IncorrectTicket);

      **ctx.accounts.token_lottery.to_account_info().try_borrow_mut_lamports()? -= ctx.accounts.token_lottery.lottery_pot_amount;
      **ctx.accounts.payer.try_borrow_mut_lamports()? += ctx.accounts.token_lottery.lottery_pot_amount;

      ctx.accounts.token_lottery.lottery_pot_amount = 0;
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(_lottery_id : u64)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut, 
           seeds = [TOKEN_LOTTERY_CONFIG.as_ref(), payer.key().as_ref(), &_lottery_id.to_be_bytes()],
           bump
       )]
       pub token_lottery: Box<Account<'info, LotteryConfig>>,

    #[account(
        mut,
        seeds = [b"collection_mint".as_ref()],
        bump,
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(
        seeds = [token_lottery.winner.to_le_bytes().as_ref()],
        bump,
    )]
    pub ticket_mint: InterfaceAccount<'info, Mint>,

    #[account(
        seeds = [b"metadata", token_metadata_program.key().as_ref(), ticket_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata: Account<'info, MetadataAccount>,

    #[account(
        associated_token::mint = ticket_mint,
        associated_token::authority = payer,
        associated_token::token_program = token_program,
    )]
    pub destination: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub collection_metadata: Account<'info, MetadataAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub token_metadata_program: Program<'info, Metadata>,
}
